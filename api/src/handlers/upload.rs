use rocket::{form::Form, fs::TempFile};
use std::{fs, path::Path};
use uuid::Uuid;

const UPLOAD_BASE: &str = "./storage";

#[derive(FromForm)]
pub struct Upload<'r> {
    dest_folder: String,
    file: TempFile<'r>,
}

// TODO: clean up unwrap and expect
#[post("/upload-image", data = "<upload>")]
pub async fn upload_image(mut upload: Form<Upload<'_>>) -> std::io::Result<()> {
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

    println!("destination = {:?}", path.as_os_str());

    upload.file.persist_to(path).await?;
    let paths = fs::read_dir(&dir_path).unwrap();

    for path in paths {
        println!(
            "Full Path of file: {}",
            path.as_ref().unwrap().path().display()
        );
        println!(
            "File name: {}",
            path.unwrap()
                .path()
                .to_str()
                .unwrap()
                .split(dir_path.as_str())
                .collect::<Vec<&str>>()[1]
        )
        // TODO: push the path in the url array (or set in mongodb) for the photo box with the `dest_folder`
    }

    Ok(())
}
