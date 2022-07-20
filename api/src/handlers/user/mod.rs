extern crate bcrypt;

use crate::{db::mongodb::MongoORM, models::user::User};
use bcrypt::hash;
use mongodb::results::InsertOneResult;
use rocket::{http::Status, serde::json::Json, State};

/// Route handler to create a new user.
/// Users need to have a unique nickname and email.
///
/// #### [**ADD A UNIQUE COMPOMPOUND INDEX ON THE DATABASE COLLECTION LEVEL**](https://www.mongodb.com/docs/manual/core/index-unique/#unique-compound-index)
/// Inserting a non-unique email or nickname panics in this fn. Rocket treats it as a 500 error.
/// Maybe the MongoDB driver still needs to implement handling this error gracefully.
#[post("/user", format = "json", data = "<user>")]
pub fn add_user(
    db: &State<MongoORM>,
    user: Json<User>,
) -> Result<(Status, Json<InsertOneResult>), Status> {
    // Check if user with the email/username already exists
    // Return Status::UnprocessableEntity
    // Uniqueness check is implemented with a Unit Compound Index. This has to be set on the collection itself.
    // Can be done with MongoDB Compass

    let hashed_pw = match hash(&user.password, 4) {
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
