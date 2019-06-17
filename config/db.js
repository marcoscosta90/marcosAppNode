if(process.env.NODE_ENV == "production"){
  module.exports = {mongoURI: "mongodb+srv://marcoscosta90:delirinho218872@cluster0-xtrzt.mongodb.net/test?retryWrites=true&w=majority"}
}else {
  module.exports = {mongoURI: "mongodb://localhost:27017/blogapp"}
}
