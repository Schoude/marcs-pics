use crate::{
    db::mongodb::MongoORM,
    models::{auth::Credentials, user::UserFound},
    utils::random_string,
};
use base64::{decode, encode};
use bcrypt::verify;
use rocket::{
    http::{Cookie, CookieJar, SameSite, Status},
    serde::json::Json,
    time::Duration,
    State,
};
use std::str;

const SESSION_COOKIE_LIFE_TIME_SECONDS: i64 = 600;
pub const SESSION_COOKIE_NAME: &str = "m_p_session";

/// Checks the Users's credentials, on success sets a session cookie and saves a session in the database.
#[post("/login", format = "json", data = "<credentials>")]
pub fn login(cookies: &CookieJar, db: &State<MongoORM>, credentials: Json<Credentials>) -> Status {
    // 1) find the user by email
    // credentials.
    let found_user = match db.get_user_by_email_full(&credentials.email) {
        Ok(user) => user,
        // 1.2) if not found respond with 404
        Err(_) => return Status::NotFound,
    };

    // 2) compare the given and crypted pw
    let res = match verify(&credentials.password, &found_user.password) {
        Ok(r) => r,
        // 2.1) if invalid respond with 401
        Err(_) => return Status::Unauthorized,
    };

    if !res {
        return Status::Unauthorized;
    }

    // 3) save a session in DB with the authorized user data (nickname, email, role)
    // set an index for created_at (BSON date time is ok) with expireAfterSeconds: SESSION_COOKIE_LIFE_TIME
    // can be set via MongDB Compass add TTL propertie for secnds to live

    // 4) on success create and set the cookie.
    let hash = random_string(12);
    match db.create_user_session(&found_user.id.unwrap(), &hash) {
        Ok(_) => (),
        Err(_) => return Status::InternalServerError,
    };

    // 4.1) use the base64 encoded session hash as the session key
    let value = encode(hash);

    let cookie = Cookie::build(SESSION_COOKIE_NAME, value)
        .max_age(Duration::seconds(SESSION_COOKIE_LIFE_TIME_SECONDS))
        .secure(true)
        .same_site(SameSite::Strict)
        .http_only(true)
        .finish();
    cookies.add(cookie);

    Status::Accepted
}

/// Logs the user out by removing the session cookie and deleting the session entry in the database.
#[post("/logout")]
pub fn logout(cookies: &CookieJar, db: &State<MongoORM>) -> Status {
    // 1) try to get the cookie to remove the session in database matching on its hash;
    let cookie = match cookies.get(SESSION_COOKIE_NAME) {
        Some(c) => c,
        None => {
            println!("no cookie found");
            return Status::Unauthorized;
        }
    };

    // 1.1) remove session cookie
    cookies.remove(Cookie::named(SESSION_COOKIE_NAME));

    // 2) delete session from DB
    let hash = cookie.value();
    let bytes = match decode(hash) {
        Ok(res) => res,
        Err(_) => return Status::InternalServerError,
    };
    let decoded_hash = str::from_utf8(&bytes).unwrap();

    match db.delete_user_session_by_hash(decoded_hash) {
        Ok(_) => Status::Accepted,
        Err(_) => Status::InternalServerError,
    }
}

/// Returns UserFound if both a session cookie and a session in the database are present.
#[get("/me")]
// actually should return Result<(Json(UserFound), Status), Status>
pub fn me(cookies: &CookieJar, db: &State<MongoORM>) -> Result<(Status, Json<UserFound>), Status> {
    // 1) try to get the cookie
    let cookie = match cookies.get(SESSION_COOKIE_NAME) {
        Some(c) => c,
        None => {
            println!("no cookie found");
            return Err(Status::Unauthorized);
        }
    };

    // 2) decode the cookkie value -> user session id in db
    let hash = cookie.value();
    let bytes = match decode(hash) {
        Ok(res) => res,
        Err(_) => return Err(Status::InternalServerError),
    };
    let decoded_hash = str::from_utf8(&bytes).unwrap();
    let found_session = match db.get_user_session_by_hash(decoded_hash) {
        Ok(session) => session,
        Err(_) => return Err(Status::InternalServerError),
    };

    let found_user = db.get_user_by_id(&found_session.user_id.to_string());
    match found_user {
        Ok(user) => Ok((Status::Ok, Json(user))),
        Err(_) => Err(Status::InternalServerError),
    }
}
