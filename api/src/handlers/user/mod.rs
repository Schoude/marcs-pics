use crate::models::user::{NewUser, User};
use mongodb::bson::oid::ObjectId;
use rocket::{response::status::Created, serde::json::Json};

#[post("/user", format = "json", data = "<user>")]
pub fn add_user(user: Json<NewUser>) -> Created<Json<User>> {
    let new_user = User {
        _id: ObjectId::new(),
        nickname: user.0.nickname,
        email: user.0.email,
        password: user.0.password,
        role: user.0.role,
    };
    let location = format!("/api/user/{}", new_user._id.to_string());
    Created::new(location).body(Json(new_user))
}
