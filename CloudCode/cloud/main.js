
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.beforeSave('Message',function(request,response){
  var query = new Parse.Query(Parse.User);
  query.get(request.object.get('userid'),{
    success:function(user){
      request.object.set('user',user);
      response.success();
    },
    error:function(error){
      response.error(error.Message);
    }
  });
});

Parse.Cloud.define("setStatus",function(request,response){
  var query = new Parse.Query(Parse.User);
  query.get(request.params.user,{
    success:function(user){
      user.set('online',request.params.status);
      response.success({status:true})
    },
    error:function (error) {
      response.error(error);
    }
  });
});
