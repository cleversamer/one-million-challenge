import styled from "styled-components";

const Navbar = () => {
  return (
    <Container>
      <Logo>$1M IN 1K DAYS CHALLENGE</Logo>
      <Avatar />
    </Container>
  );
};

const Container = styled.aside`
  align-items: center;
  background-color: #171314;
  display: flex;
  height: 100px;
  justify-content: center;
  position: relative;
  width: 100vw;
`;

const Logo = styled.h1`
  color: #e99e09;
  font-size: 36px;
  font-weight: 500;
  text-transform: uppercase;
`;

const Avatar = styled.div`
  background-image: url("/assets/images/avatar-1.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 50%;
  border: 3px solid #e99e09;
  height: 85px;
  left: 10px;
  position: absolute;
  width: 85px;
`;

export default Navbar;
