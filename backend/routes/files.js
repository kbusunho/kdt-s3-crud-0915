import { Router } from 'express';
import { nanoid } from 'nanoid';

import FileItem from '../models/FileItem.js';
import { presignGet, presignPut, deleteObject } from '../src/s3.js';

const router = Router()

router.post('/presign', async (req, res) => {
  try {
    const { filename, contentType } = req.body;

    // 필수 값 확인
    if (!filename || !contentType) {
      return res.status(400).json({ error: "filename/contentType 필수 입니다." });
    }

    // S3에 저장할 고유 key 생성 
    // nanoid는 고유한 ID 문자열을 생성해주는 라이브러리
    const key = `uploads/${Date.now()}-${nanoid(6)}-${filename}`;


    // presigned URL 발급
    const url = await presignPut(key, contentType);

    res.json({ url, key })
  } catch (error) {
    console.error("❌ presign 에러:", error);
    res.status(500).json({ error: "프리사인드 URL 생성에 실패했습니다" });
  }
})

// thunderClient  확인
router.post("/", async (req, res) => {
  try {
    // 요청에서 메타데이터 꺼내오기
    const {
      key,
      originalName,
      contentType,
      size,
      title = "",
      description = ""
    } = req.body;

    // DB에 새로운 문서 생성
    const doc = await FileItem.create({
      key,           // S3에 저장된 파일의 고유 key
      originalName,  // 사용자가 업로드한 원래 파일명
      contentType,   // 파일의 MIME 타입
      size,          // 파일 크기 (바이트 단위)
      title,         // 사용자가 입력한 제목
      description    // 사용자가 입력한 설명
    });

    // 성공 응답
    res.status(201).json({ message: "S3 메타데이터 저장 완료", doc });
  } catch (error) {
    console.error("❌ 메타데이터 저장 에러:", error);
    res.status(500).json({ error: "메타데이터 저장 실패" });
  }
});

// 파일 메타데이터 목록 조회 API
router.get("/", async (req, res) => {
  try {
    // DB에서 모든 FileItem을 생성일(createdAt) 기준으로 내림차순 정렬하여 조회
    // lean() → mongoose Document가 아닌 일반 JS 객체로 반환 (성능 최적화)
    const items = await FileItem.find().sort({ createdAt: -1 }).lean();

    // 각 파일마다 presigned GET URL 생성 (유효시간: 300초)
    const out = await Promise.all(
      items.map(async (it) => ({
        ...it,                       // 기존 메타데이터
        url: await presignGet(it.key, 300) // 접근 가능한 다운로드 URL 추가
      }))
    );

    // 최종 결과 응답
    res.json(out);
  } catch (error) {
    console.error("❌ 파일 목록 조회 에러:", error);
    res.status(500).json({ error: "파일 목록 조회 실패" });
  }
});

// 단건 파일 메타데이터 단건 조회 API
router.get("/:id", async (req, res) => {
  try {
    // 요청 파라미터(:id)로 MongoDB에서 해당 문서 찾기
    const it = await FileItem.findById(req.params.id).lean();

    // 문서가 없으면 404(Not Found) 응답
    if (!it) return res.sendStatus(404);

    // presigned GET URL 생성 (300초 유효)
    it.url = await presignGet(it.key, 300);

    // 결과 반환
    res.json(it);
  } catch (error) {
    console.error("❌ 단건 조회 에러:", error);
    // 서버 내부 에러 응답
    res.status(500).json({ error: "파일 단건 조회 실패" });
  }
});

// 파일 메타데이터 수정 API
router.patch("/:id", async (req, res) => {
  try {
    // 요청 바디에서 수정할 필드 꺼내오기
    const { title, description } = req.body;

    // 해당 id 문서를 찾아 title/description 업데이트
    // { new: true } → 업데이트된 최신 문서를 반환하도록 설정
    const it = await FileItem.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );

    // 문서를 못 찾으면 404 응답
    if (!it) return res.sendStatus(404);

    // 성공적으로 수정된 문서를 반환
    res.json(it);
  } catch (error) {
    console.error("❌ 메타데이터 수정 에러:", error);
    // 서버 내부 에러 응답
    res.status(500).json({ error: "파일 메타데이터 수정 실패" });
  }
});

// 파일 삭제 API (DB 문서 + S3 객체 동시 삭제)
router.delete("/:id", async (req, res) => {
  try {
    // DB에서 해당 id 문서 찾기
    const it = await FileItem.findById(req.params.id);

    // 없으면 404 Not Found 반환
    if (!it) return res.sendStatus(404);

    // S3 버킷에서 실제 파일 삭제
    await deleteObject(it.key);

    // DB에서 메타데이터 문서 삭제
    await it.deleteOne();

    // 성공 시 202 
    res.status(200).json({ message: "파일 삭제 완료",id: req.params.id  });
  } catch (error) {
    console.error("❌ 파일 삭제 에러:", error);
    res.status(500).json({ error: "파일 삭제 실패" });
  }
});


export default router;