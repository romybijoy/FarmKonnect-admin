import React, { useState } from "react";
import { createUser } from "../../redux/slices/UserSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Firebase } from "../../firebase/config";
import FormContainer from "../../components/Form/FormContainer";
import { Button, Form, Image } from "react-bootstrap";
import Loader from "../../components/Loader/Loader";

import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    role: "",
    image: "",
  });
  const [image, setImage] = useState();

  const navigate = useNavigate();

  const dispatch = useDispatch();


  const { users, error, loading } = useSelector((state) => state.app);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    console.log(e.target.files[0]);
    Firebase.storage()
      .ref(`/image/${e.target.files[0].name}`)
      .put(e.target.files[0])
      .then(({ ref }) => {
        ref.getDownloadURL().then((url) => {
          console.log(e.target.name, url);
          setFormData({ ...formData, [e.target.name]: url });
        });
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log(formData);
      dispatch(createUser(formData));
      // Clear the form fields after successful registration
      setFormData({
        name: "",
        email: "",
        password: "",
        mobileNumber: "",
        role: "",
        image: ""
      });

      if(error){
        toast.error(error);
        navigate("/signup");
      }else{
      toast.success("User registered successfully");
      navigate("/login");
      }
    } catch (err) {
      toast.error(error);
    }
   
  };

  return (
    <FormContainer className="p-3">
      <h1>Registration</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="my-2" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="Enter name"
            value={formData.name}
            onChange={handleInputChange}
          ></Form.Control>
        </Form.Group>

        <Form.Group className="my-2" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleInputChange}
            required
          ></Form.Control>
        </Form.Group>

        <Form.Group className="my-2" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleInputChange}
            required
          ></Form.Control>
        </Form.Group>

        <Form.Group className="my-2" controlId="city">
          <Form.Label>Mobile Number</Form.Label>
          <Form.Control
            type="text"
            name="mobileNumber"
            placeholder="Enter Mobile number"
            value={formData.mobileNumber}
            onChange={handleInputChange}
            required
          ></Form.Control>
        </Form.Group>

        <Form.Group className="my-2" controlId="role">
          <Form.Label>Role</Form.Label>
          <Form.Select
            aria-label="Role"
            name="role"
            // value={formData.role}
            onChange={handleInputChange}
          >
            <option>Select..</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="my-2" controlId="image">
          <Form.Label>Profile Image</Form.Label>
          <br />
          <Image
            alt=""
            width="200px"
            height="200px"
            src={
              image ? (
                formData.image === "" ? (
                  <p>Loading...</p>
                ) : (
                  URL.createObjectURL(image)
                )
              ) : (
                ""
              )
            }
          ></Image>

          <br />
          <input type="file" name="image" onChange={handleImageChange} />
        </Form.Group>

        

        <Button type="submit" variant="primary" className="mt-3">
          Submit
        </Button>
      </Form>
    </FormContainer>
  );
};

export default Register;
