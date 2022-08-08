use crate::{db::mongodb::MongoORM, guards::has_session::HasSession};
use rocket::{form::Form, fs::TempFile, http::Status, State};
use std::{fs, path::Path};
use uuid::Uuid;

const UPLOAD_BASE: &str = "./storage";

#[derive(FromForm)]
pub struct Upload<'r> {
    dest_folder: String,
    file: TempFile<'r>,
}

/// Uploads a file to the given destination folder.
// TODO: clean up unwrap and expect
#[post("/image-upload", data = "<upload>")]
pub async fn image_upload(
    mut upload: Form<Upload<'_>>,
    _has_session: HasSession,
    db: &State<MongoORM>,
) -> Result<Status, Status> {
    let file_name = Uuid::new_v4();
    let dir_path = format!("{}/{}/", UPLOAD_BASE, &upload.dest_folder);
    let dest_exists = Path::new(&dir_path).is_dir();

    if !dest_exists {
        fs::create_dir(&dir_path).ok();
    }

    let path = format!(
        "{}{}.{}",
        dir_path,
        file_name,
        &upload.file.content_type().unwrap().extension().unwrap(),
    );
    let path = Path::new(&path);

    if upload.file.persist_to(path).await.is_err() {
        return Err(Status::InternalServerError);
    }

    let mut path_string = path.to_str().unwrap().to_string();
    path_string.replace_range(0..1, "");

    // save the path to the photo box
    let update_result = db.add_url_to_photo_box(&upload.dest_folder, &path_string);

    match update_result {
        Ok(_) => Ok(Status::Created),
        Err(_) => Err(Status::InternalServerError),
    }
}

/// Delete an image based on the url.
#[delete("/image-delete?<id>&<urls>")]
pub fn image_delete(id: &str, urls: &str, db: &State<MongoORM>) -> Result<Status, Status> {
    let paths = urls.split(',').collect::<Vec<&str>>();

    let mut result: Result<Status, Status> = Err(Status::InternalServerError);

    for path in paths.iter() {
        println!("*********** PATH: {}", path);
        match fs::remove_file(format!(".{}", path)) {
            Ok(res) => res,
            Err(_) => return Err(Status::InternalServerError),
        };

        let update_result = db.remove_url_from_photo_box(&id.to_string(), &path.to_string());

        result = match update_result {
            Ok(_) => Ok(Status::Ok),
            Err(_) => Err(Status::InternalServerError),
        };
    }

    result
}
