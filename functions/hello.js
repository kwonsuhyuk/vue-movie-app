exports.handler = async function (event, context) {
  return {
    statusCode : 200,
    body : JSON.stringify({
      name : 'Suhyuk',
      age : 25,
      email : 'tngur0716@hanyang.ac.kr'
    })
  }
}