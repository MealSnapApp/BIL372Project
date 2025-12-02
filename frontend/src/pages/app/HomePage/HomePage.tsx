import React, { useState } from 'react';
import './HomePage.css';
import { Button, Modal, Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { createPost, uploadImage } from '../../../services/PostServices/PostService';

const { TextArea } = Input;

const HomePage = () => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [fileList, setFileList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);


  const handleOk = async () => {
    try {
      setSubmitting(true);
      let image_path: string | undefined = undefined;
      let thumb_path: string | undefined = undefined;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const uploaded = await uploadImage(fileList[0].originFileObj as File);
        image_path = uploaded.path;
        thumb_path = uploaded.thumb_path;
      }

      if (!content.trim() && !image_path) {
        message.warning('Please enter content or choose an image.');
        setSubmitting(false);
        return;
      }

      const resp = await createPost({ content: content.trim() || undefined, image_path, thumb_path });
      if (resp.success) {
        message.success('Post shared');
        setOpen(false);
        setContent('');
        setFileList([]);
      } else {
        message.error(resp.errorMessage || 'Failed to share post');
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const beforeUpload = () => {
    // Upload'ı manuel yöneteceğiz, otomatik yükleme olmasın
    return false;
  };

  return (
    <div className="home-page-container">
      <div className="welcome-section">
        <h1>Welcome Back!</h1>
        <p>Track your meals and stay healthy.</p>
        <Button type="primary" onClick={() => setOpen(true)}>Post Meal</Button>
      </div>

      <Modal
        title="New Post"
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okText="Share"
        cancelText="Cancel"
        confirmLoading={submitting}
      >
        <TextArea
          rows={4}
          placeholder="Write content... (optional)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <Upload
          listType="picture"
          maxCount={1}
          beforeUpload={beforeUpload}
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
        >
          <Button icon={<UploadOutlined />}>Add Photo</Button>
        </Upload>
      </Modal>


    </div>
  );
};

export default HomePage;
