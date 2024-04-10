import React from 'react';
import styled from 'styled-components';
import FileUploadForm from './FileUploadForm';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Title = styled.h1`
  color: #333;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`;
function App() {
  return (
    <AppContainer>
      <Title>May's File Upload System built with AWS Lambda, DynamoDB, S3, and EC2</Title>
      <FileUploadForm />
    </AppContainer>
  );
}

export default App;
