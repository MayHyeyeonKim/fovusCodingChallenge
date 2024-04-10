import React, { useState } from "react";
import styled from "styled-components";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 5px;
`;

const Button = styled.button`
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.REACT_APP_AWS_REGION,
});

const FileUploadForm = () => {
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState(null);

  // 사전 서명된 POST 데이터 생성 함수 -> 이건 어디서 쓰이는거지?
  const createPresignedPostData = async (fileName, fileType) => {
    // POST 요청에 필요한 필드와 URL을 생성
    return await createPresignedPost(s3Client, {
      Bucket: "fovus-storage",
      Key: fileName,
      Expires: 60, // URL의 유효 시간(초)
      Conditions: [{ "Content-Type": fileType }],
      Fields: {
        "Content-Type": fileType,
      },
    });
  };

  const handleTextChange = (e) => {
    setInputText(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      console.error("No file selected for upload");
      return;
    }

    const s3Path = `fovus-bucket-folder1/${file.name}`;

    // 파일 업로드를 위한 PutObjectCommand 설정
    const putCommand = new PutObjectCommand({
      Bucket: "fovus-storage",
      Key: s3Path,
      Body: file, // 여기서 file은 파일의 데이터가 담긴 Blob 또는 Stream
      ContentType: file.type, // 옵션: 파일 타입 설정
      ACL: "public-read", // 옵션: 파일을 공개적으로 읽을 수 있도록 설정 (필요한 경우에만 사용)
    });

    try {
      const response = await s3Client.send(putCommand);
      console.log("File successfully uploaded to S3", response);
    } catch (error) {
      console.error("An error occurred while uploading to S3", error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        value={inputText}
        onChange={handleTextChange}
        placeholder="Enter text"
      />
      <Input type="file" onChange={handleFileChange} />
      <Button type="submit">Submit</Button>
    </Form>
  );
};

export default FileUploadForm;
