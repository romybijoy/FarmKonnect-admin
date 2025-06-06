import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { appConfig } from '../../config'
const ip = `${appConfig.ip}/user`;
const baseQuery = fetchBaseQuery({ baseUrl: ip });

export const ApiSlice = createApi({
  baseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({}),
});
