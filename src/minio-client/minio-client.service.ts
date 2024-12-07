import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { ConfigService } from '@nestjs/config';
import { User } from '@user/entities/user.entity';
import { BufferedFile } from '@minio-client/interface/file.model';
import * as crypto from 'node:crypto';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  private readonly baseBucket: string;

  private get client() {
    return this.minioService.client;
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly minioService: MinioService,
  ) {
    this.logger = new Logger('MinioClientService');
    this.baseBucket = this.configService.get('MINIO_BUCKET');
  }

  // 유저 프로필 사진 업로드
  public async profileImgUpload(
    user: User,
    files: BufferedFile[],
    categoryName: string,
    baseBucket: string = this.baseBucket,
  ) {
    const uploadUrl: string[] = [];

    if (files.length > 5) {
      throw new HttpException('5개까지만 허용', HttpStatus.BAD_REQUEST);
    } else {
      for (const file of files) {
        if (
          !(
            file.mimetype.includes('png') ||
            file.mimetype.includes('jpg') ||
            file.mimetype.includes('jpeg')
          )
        ) {
          throw new HttpException(
            '파일 업로드 에러입니다.',
            HttpStatus.BAD_REQUEST,
          );
        }

        const temp_filename = Date.now().toString();
        const hashFilename = crypto
          .createHash('md5')
          .update(temp_filename)
          .digest('hex');

        const ext = file.originalname.substring(
          file.originalname.lastIndexOf('.'),
          file.originalname.length,
        );
        const metaData = {
          'Content-Type': file.mimetype,
          'X-Amz-Meta-Testing': 1234,
        };

        const filename = `${hashFilename}${ext}`;
        const fileBuffer = file.buffer;
        const filePath = `${categoryName}/${user.id}/${filename}`;

        // 파일 서버에 파일 넣기
        await new Promise<void>((resolve, reject) => {
          this.client.putObject(
            baseBucket,
            filePath,
            fileBuffer,
            fileBuffer.length,
            metaData,
            (error) => {
              if (error) {
                console.log('파일 업로드 에러: ' + error.message);

                return reject(
                  new HttpException(
                    '업로드 에러입니다.',
                    HttpStatus.BAD_REQUEST,
                  ),
                );
              }

              resolve();
            },
          );
        });
        uploadUrl.push(
          `http://${this.configService.get('MINIO_ENDPOINT')}:${this.configService.get('MINIO_PORT')}/${this.configService.get('MINIO_BUCKET')}/${filePath}`,
        );
      }

      return uploadUrl;
    }
  }

  //  파일 서버에 수정한 파일만 남겨두고 기존 파일 삭제
  async deleteFolderContents(bucketName: string, folderPath: string) {
    const objectList = [];
    const stream = this.client.listObjects(bucketName, folderPath, true);

    // 파일이 여러개일 경우, 전체 넣기
    for await (const obj of stream) {
      objectList.push(obj.name);
    }

    if (objectList.length > 0) {
      const result = await this.client.removeObjects(bucketName, objectList);

      console.log('삭제 성공: ' + result);
    }

    console.log('삭제할 파일 없음');
  }
}
