import { useState } from "react";
import api from "../api";
import "./style/UploadForm.scss"
const UploadForm = ({ onDone }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const upload = async (e) => {
    e.preventDefault()
    if (!file) return
    try {
      console.log("📂 업로드 시작:", file);

      // 1) presign 요청
      const { data: { url, key } } = await api.post('/files/presign', {
        filename: file.name,
        contentType: file.type
      });
      console.log(" presign 발급 성공:", { url, key });

      // 2) S3 업로드
      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });
      console.log(" S3 업로드 성공:", key);

      // 3) DB 메타데이터 저장
      const metaRes = await api.post("/files", {
        key,
        originalName: file.name,
        contentType: file.type,
        size: file.size,
        title,
        description: desc
      });
      console.log(" DB 저장 성공:", metaRes.data);
      onDone?.();
      // 4) 완료
      console.log("🎉 업로드 완료");
    } catch (error) {
      console.error("❌ 업로드 에러:", error);
    }

  }
  return (
    <form className="form-list" onSubmit={upload} >
      <input type="file" className="file-btn" onChange={e => setFile(e.target.files[0])} />
      <input type="text" placeholder="title" value={title} onChange={e => setTitle(e.target.value)} />
      <input type="text" placeholder="description" value={desc} onChange={e => setDesc(e.target.value)} />
      <button type="submit" className="upload-btn">Upload</button>
    </form>
  )
}

export default UploadForm