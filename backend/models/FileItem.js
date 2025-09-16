import mongoose from "mongoose";

const FileItemSchema = new mongoose.Schema(
    {
    // AWS S3 등에 업로드된 파일을 식별하기 위한 고유 key (필수값, 인덱스 생성)
    key: {
      type: String,
      required: true,
      index: true,
    },

    // 사용자가 업로드할 때의 원본 파일 이름
    originalName: String,

    // MIME 타입 (예: image/png, application/pdf 등)
    contentType: String,

    // 파일 크기 (바이트 단위)
    size: Number,

    // 파일의 제목 (사용자가 추가 입력한 메타데이터)
    title: String,

    // 파일에 대한 설명 (사용자가 추가 입력한 메타데이터)
    description: String,
  },
    {
    // createdAt, updatedAt 필드를 자동으로 추가
    timestamps: true,
  }
)


// 'FileItem'이라는 이름의 모델을 생성하여 다른 곳에서 사용 가능하게 export
export default mongoose.model("FileItem", FileItemSchema);
