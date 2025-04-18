import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { ConfigService } from '@nestjs/config';
import { User } from '@user/entities/user.entity';
import { BufferedFile } from '@minio-client/interface/file.model';
import * as crypto from 'node:crypto';
import { Car } from '@car/entities/car.entity';
import { Accommodation } from '@accommodation/entities/accommodation.entity';

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

  // 숙소 사진 업로드
  public async accommodationImgsUpload(
    accommodation: Accommodation,
    files: BufferedFile[],
    categoryName: string,
    baseBucket: string = this.baseBucket,
  ) {
    const uploadUrl: string[] = [];

    if (files.length > 10) {
      throw new HttpException(
        '숙소에 대한 이미지는 최대 10개까지 가능합니다.',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      // 기존 파일 존재 시, 해당되는 폴더 삭제
      if (`${categoryName}/${accommodation.id}`.includes(accommodation.id)) {
        await this.deleteFolderContents(
          this.baseBucket,
          `${categoryName}/${accommodation.id}/`,
        );
      }

      for (const file of files) {
        // 해당 파일이 아닐 경우 error
        if (
          !(
            file.mimetype.includes('png') ||
            file.mimetype.includes('jpg') ||
            file.mimetype.includes('jpeg')
          )
        ) {
          throw new HttpException(
            '파일 업로드가 불가한 파일이 있습니다.',
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
        const filePath = `${categoryName}/${accommodation.id}/${filename}`;

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
        uploadUrl.push(this.getUploadUrl(filePath));
      }
      return uploadUrl;
    }
  }

  // 자동차 사진 업로드
  public async carImgsUpload(
    car: Car,
    files: BufferedFile[],
    categoryName: string,
    baseBucket: string = this.baseBucket,
  ) {
    const uploadUrl: string[] = [];

    // 기존 파일 존재 시, 해당되는 폴더 삭제
    if (`${categoryName}/${car.id}`.includes(car.id)) {
      await this.deleteFolderContents(
        this.baseBucket,
        `${categoryName}/${car.id}/`,
      );
    }

    for (const file of files) {
      // 해당 파일이 아닐 경우 error
      if (
        !(
          file.mimetype.includes('png') ||
          file.mimetype.includes('jpg') ||
          file.mimetype.includes('jpeg')
        )
      ) {
        throw new HttpException(
          '파일 업로드가 불가한 파일이 있습니다.',
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
      const filePath = `${categoryName}/${car.id}/${filename}`;

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
                new HttpException('업로드 에러입니다.', HttpStatus.BAD_REQUEST),
              );
            }

            resolve();
          },
        );
      });
      uploadUrl.push(this.getUploadUrl(filePath));
    }

    return uploadUrl;
  }

  // 유저 프로필 사진 업로드
  public async profileImgUpload(
    user: User,
    files: BufferedFile[],
    categoryName: string,
    baseBucket: string = this.baseBucket,
  ) {
    const uploadUrl: string[] = [];

    // 기존 파일 존재 시, 해당되는 폴더 삭제
    if (`${categoryName}/${user.id}`.includes(user.id)) {
      await this.deleteFolderContents(
        this.baseBucket,
        `${categoryName}/${user.id}/`,
      );
    }

    if (files.length > 3) {
      throw new HttpException(
        '프로필 이미지는 3개까지만 허용합니다.',
        HttpStatus.BAD_REQUEST,
      );
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
            '파일 업로드가 불가한 파일이 있습니다.',
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
        uploadUrl.push(this.getUploadUrl(filePath));
      }

      return uploadUrl;
    }
  }

  // 파일 업로드 url
  private getUploadUrl(filePath: string): string {
    // const endPoint = this.configService.get('MINIO_ENDPOINT');
    // const port = this.configService.get('MINIO_PORT');
    const bucket = this.configService.get('MINIO_BUCKET');
    // const port = this.configService.get('MINIO_EXTERNAL_PORT');

    return `http://localhost:9011/${bucket}/${filePath}`;
  }

  //  파일 서버에 수정한 파일만 남겨두고 기존 파일 삭제
  private async deleteFolderContents(bucketName: string, folderPath: string) {
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
