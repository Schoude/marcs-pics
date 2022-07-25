use rocket::{
    http::{Cookie, CookieJar, SameSite, Status},
    time::Duration,
};

const SESSION_COOKIE_LIFE_TIME_SECONDS: i64 = 600;
const SESSION_COOKIE_NAME: &str = "m_p_session";

/// Checks the Users's credentials and on success sets a session cookie.
#[post("/login")]
pub fn login(cookies: &CookieJar) -> Status {
    // 1) find the user by email
    // 1.2) if not found respond with 404
    // 2) compare the given and crypted pw
    // 2.1) if invalid respond with 401
    // 3) save a session in DB with the authorized user data (nickname, email, role)
    // set an index for created_at (BSON date time is ok) with expireAfterSeconds: SESSION_COOKIE_LIFE_TIME
    // can be set via MongDB Compass add TTL propertie for secnds to live

    // 4) on success create and set the cookie.
    // 4.1) use the base64 encoded session id as the session key
    let cookie = Cookie::build(
        SESSION_COOKIE_NAME,
        "encoded_session_key_from_new_session_id",
    )
    .max_age(Duration::seconds(SESSION_COOKIE_LIFE_TIME_SECONDS))
    .secure(true)
    .same_site(SameSite::Strict)
    .finish();
    cookies.add(cookie);
    Status::Accepted
}

/// Logout a user by removing the session cookie and deleting the session entry in the database.
#[post("/logout")]
pub fn logout(cookies: &CookieJar) -> Status {
    // 1) remove session cookie
    cookies.remove(Cookie::named(SESSION_COOKIE_NAME));

    // 2) delete session from DB
    Status::Accepted
}

/// Returns the User if a session cookie and a session in the database are present.
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
