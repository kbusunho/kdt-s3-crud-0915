
import './App.scss'
import FileList from './components/FileList'
import UploadForm from './components/UploadForm'
import { useRef } from 'react'
function App() {
  // FileList 컴포넌트를 제어하기 위한 ref 생성
  const listRef = useRef(null);

  // 업로드 완료 후 FileList의 load() 메서드를 호출해 목록 새로고침
  const reload = () => listRef.current?.load?.();
  return (
    <div className='container'>
      {/* 업로드 폼 (파일 업로드 성공 시 reload 실행) */}
      <UploadForm onDone={reload} />
      {/* 간단히 리프레시 하기 위해 ref를 이용한 key 트릭 대신 load 메서드 호출 */}
      <FileList ref={listRef} />
    </div>
  )
}

export default App
