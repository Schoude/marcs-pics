use crate::{db::mongodb::MongoORM, models::auth::Credentials, utils::random_string};
use base64::encode;
use bcrypt::verify;
use rocket::{
    http::{Cookie, CookieJar, SameSite, Status},
    serde::json::Json,
    time::Duration,
    State,
};

const SESSION_COOKIE_LIFE_TIME_SECONDS: i64 = 600;
const SESSION_COOKIE_NAME: &str = "m_p_session";

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
pub fn logout(cookies: &CookieJar) -> Status {
    // 1) remove session cookie
    cookies.remove(Cookie::named(SESSION_COOKIE_NAME));

    // 2) delete session from DB
    Status::Accepted
}

/// Returns UserFound if both a session cookie and a session in the database are present.
#[get("/me")]
// actually should return Result<(Json(UserFound), Status), Status>
pub fn me(cookies: &CookieJar) -> Status {
    // 1) try to get the cookie
    let cookie = match cookies.get(SESSION_COOKIE_NAME) {
        Some(c) => c,
        None => {
            println!("no cookie found");
            return Status::Unauthorized;
        }
    };

    // 2) decode the cookkie value -> user session id in db
    let value = cookie.value();
    println!("value {value}");

    // 3) try to get user session in db
    // 4) make a new UserFound from the data in the session cookie
    // 5) return the UserFound as Json
    Status::Ok
}
