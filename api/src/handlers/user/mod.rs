use crate::models::user::User;
use mongodb::bson::oid::ObjectId;
use rocket::{response::status::Created, serde::json::Json};

/// Adds a new user to the database.
#[post("/user", format = "json", data = "<user>")]
pub fn add_user(user: Json<User>) -> Created<Json<User>> {
    let new_user = User {
        _id: Some(ObjectId::new()),
        nickname: user.0.nickname,
        // TODO: bcrypt the password!
        email: user.0.email,
        password: user.0.password,
        role: user.0.role,
    };

    // TODO: user helper fn to insert user in DB
    // check if the object id in memory and in DB is identical
    // check if user with the same email address already exists

    // TODO: use if let Some(new_user.id) or a match
    // return a custom status https://rocket.rs/v0.5-rc/guide/responses/#wrapping
    let location = format!("/api/user/{}", new_user._id.unwrap());
    Created::new(location).body(Json(new_user))
}
