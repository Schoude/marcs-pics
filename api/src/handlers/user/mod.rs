extern crate bcrypt;

use crate::{db::mongodb::MongoORM, models::user::User};
use bcrypt::hash;
use mongodb::results::InsertOneResult;
use rocket::{http::Status, serde::json::Json, State};

/// Adds a new user to the database.
#[post("/user", format = "json", data = "<user>")]
pub fn add_user(
    db: &State<MongoORM>,
    user: Json<User>,
) -> Result<(Status, Json<InsertOneResult>), Status> {
    // TODO: check if user with the email/username already exists
    // Return Status::UnprocessableEntity

    let hashed_pw = match hash(user.password.to_owned(), 4) {
        Ok(val) => val,
        Err(_) => panic!("Error hashing to password."),
    };

    let new_user = User {
        id: None,
        nickname: user.nickname.to_owned(),
        email: user.email.to_owned(),
        password: hashed_pw,
        role: user.0.role,
    };

    let inserted_user_id = db.create_user(new_user);
    match inserted_user_id {
        Ok(user_id) => Ok((Status::Created, Json(user_id))),
        Err(_) => Err(Status::InternalServerError),
    }
}
