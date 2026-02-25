// useStomp.js
import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

/**
 * useStomp hook
 * options:
 *   url (string) - SockJS endpoint (default '/ws-endpoint')
 *   token (string) - Bearer token (optional)
 *   handlers: { onCreated, onReviewed, onModerated } - callbacks for messages
 *
 * Example:
 *   useStomp({
 *     url: '/ws-endpoint',
 *     token: localStorage.getItem('token'),
 *     handlers: {
 *       onCreated: payload => setReports(p => [payload, ...p]),
 *       onReviewed: payload => ...
 *     }
 *   });
 */
export default function useStomp({ url = '/ws-endpoint', token, handlers = {} } = {}) {
  const clientRef = useRef(null)

  useEffect(() => {
    // Create client
    const client = new Client({
      // Do not auto-connect — we'll call activate()
      brokerURL: undefined, // because we use SockJS (webSocketFactory)
      connectHeaders: {},
      // debug: msg => console.debug("STOMP:", msg),
      reconnectDelay: 5000, // in ms, auto-reconnect
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      webSocketFactory: () => {
        // Use SockJS to create a WebSocket-like object for servers that expose SockJS
        return new SockJS(url)
      },
      onConnect: () => {
        // subscribe to topics after connect
        try {
          // example topic names — adapt to backend
          client.subscribe('/topic/reports.created', (msg) => {
            if (msg.body && handlers.onCreated) handlers.onCreated(JSON.parse(msg.body))
          })

          client.subscribe('/topic/reports.reviewed', (msg) => {
            if (msg.body && handlers.onReviewed) handlers.onReviewed(JSON.parse(msg.body))
          })

          client.subscribe('/topic/posts.moderated', (msg) => {
            if (msg.body && handlers.onModerated) handlers.onModerated(JSON.parse(msg.body))
          })

          client.subscribe('/topic/appeals.created', (msg) => {
            if (handlers.onAppealCreated) handlers.onAppealCreated(JSON.parse(msg.body))
          })
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('STOMP subscribe failed', err)
        }
      },
      onStompError: (frame) => {
        // server reported error (protocol-level)
        // eslint-disable-next-line no-console
        console.error('Broker reported error: ', frame?.headers, frame?.body)
      },
      onWebSocketError: (evt) => {
        // eslint-disable-next-line no-console
        console.error('WebSocket error', evt)
      },
    })

    // add auth header if token present
    if (token) {
      client.connectHeaders = {
        Authorization: `Bearer ${token}`,
      }
    }

    clientRef.current = client
    client.activate()

    return () => {
      try {
        client.deactivate()
      } catch (e) {
        // ignore
      }
      clientRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, token, handlers.onCreated, handlers.onReviewed, handlers.onModerated])

  return { clientRef }
}
