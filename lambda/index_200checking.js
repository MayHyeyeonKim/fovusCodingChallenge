exports.handler = async (event, context) => {
  const responseBody = {
    message: "되라되라되라ㅏㅏ."
  };
  
  let body = JSON.stringify(responseBody);
  
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
  };
  return {
    statusCode,
    body,
    headers
  };
};