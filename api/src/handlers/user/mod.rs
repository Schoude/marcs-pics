extern crate bcrypt;

use crate::{
    db::mongodb::MongoORM,
    models::user::{User, UserFound, UserUpdate},
};
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

/// Returns a single user identified by its ObjectId.
#[get("/user/<id>")]
pub fn get_user_by_id(
    db: &State<MongoORM>,
    id: String,
) -> Result<(Status, Json<UserFound>), Status> {
    if id.is_empty() {
        return Err(Status::BadRequest);
    }

    let user = db.get_user_by_id(&id);
    match user {
        Ok(user) => Ok((Status::Ok, Json(user))),
        Err(_) => Err(Status::InternalServerError),
    }
}

/// Updates a Users `nickname` or `email` and returns the modified User.
#[put("/user/<id>", data = "<user_update>")]
pub fn update_nickname_or_email(
    db: &State<MongoORM>,
    id: String,
    user_update: Json<UserUpdate>,
) -> Result<(Status, Json<UserFound>), Status> {
    if id.is_empty() {
        return Err(Status::BadRequest);
    }

    let update = UserUpdate {
        nickname: user_update.nickname.to_owned(),
        email: user_update.email.to_owned(),
    };
    let update_res = db.update_nickname_or_email(&id, update);
    match update_res {
        Ok(update) => {
            if update.matched_count == 1 {
                let updated_user = db.get_user_by_id(&id);
                match updated_user {
                    Ok(user) => Ok((Status::Ok, Json(user))),
                    Err(_) => Err(Status::InternalServerError),
                }
            } else {
                Err(Status::NotFound)
            }
        }
        Err(_) => Err(Status::InternalServerError),
    }
}
