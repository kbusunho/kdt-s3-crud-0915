// AWS SDK에서 필요한 모듈 불러오기
import {
  S3Client,             // S3에 연결하기 위한 클라이언트 객체
  PutObjectCommand,     // 파일 업로드 명령
  GetObjectCommand,     // 파일 다운로드 명령
  DeleteObjectCommand   // 파일 삭제 명령
} from '@aws-sdk/client-s3';


import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; 
// presigned URL을 생성하기 위한 유틸 (클라이언트가 직접 S3에 접근할 수 있도록 임시 URL 발급)


// 환경 변수에 정의된 리전(region)으로 S3 클라이언트 생성
export const s3 = new S3Client({ region: process.env.AWS_REGION });


// 사용할 버킷 이름 (환경 변수에서 가져옴)
const Bucket = process.env.S3_BUCKET;


/**
 * presignPut
 * - 파일 업로드용 presigned URL 발급
 * - 클라이언트가 이 URL을 사용해서 S3에 직접 업로드 가능
 * 
 * @param {string} Key - S3에 저장될 객체의 key (경로/파일명)
 * @param {string} ContentType - 업로드할 파일의 MIME 타입
 * @returns {Promise<string>} presigned URL (유효시간 60초)
 */
export const presignPut = (Key, ContentType) =>
  getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket, Key, ContentType }),
    { expiresIn: 300 } // URL 유효시간 60초
  );

  /**
 * presignGet
 * - 파일 다운로드용 presigned URL 발급
 * - 클라이언트가 이 URL을 사용해 S3에서 직접 다운로드 가능
 * 
 * @param {string} Key - 다운로드할 객체의 key
 * @param {number} sec - URL 유효 시간(기본 300초 = 5분)
 * @returns {Promise<string>} presigned URL
 */

  export const presignGet = (Key, sec = 300) =>
  getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket, Key }),
    { expiresIn: sec }
  );

  /**
 * deleteObject
 * - S3에 저장된 객체 삭제
 * 
 * @param {string} Key - 삭제할 객체의 key
 * @returns {Promise} 삭제 요청 결과
 */

  export const deleteObject = (Key) =>
  s3.send(new DeleteObjectCommand({ Bucket, Key }));