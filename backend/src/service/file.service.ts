import {Injectable} from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import {v4 as uuidv4} from "uuid";

export class FilePointer {
    constructor(public relativePath: string) {
    }
}

@Injectable()
export class FileService {
    private storageDir = path.join("storage");

    constructor() {
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, {recursive: true});
        }
    }

    store(data: string): FilePointer {
        const fileName = `${uuidv4()}.base64`;
        const relativePath = fileName;
        const absolutePath = path.join(this.storageDir, fileName);
        fs.writeFileSync(absolutePath, data, "utf8");
        return new FilePointer(relativePath);
    }

    retrieve(filePointer: FilePointer): string {
        const absolutePath = path.join(this.storageDir, filePointer.relativePath);
        return fs.readFileSync(absolutePath, "utf8");
    }
}
