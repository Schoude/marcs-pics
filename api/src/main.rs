use rocket::serde::json::{json, Value};

mod models;

#[macro_use]
extern crate rocket;

const API_BASE: &str = "/api";

#[get("/")]
fn hello_world() -> &'static str {
    "Hello World"
}

/// API route not found catcher that returns a plain JSON response.
#[catch(404)]
fn not_found() -> Value {
    json!({
        "status": "error",
        "reason": "Resource was not found."
    })
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount(API_BASE, routes![hello_world])
        .register(API_BASE, catchers!(not_found))
}
