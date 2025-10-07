import React, { useState } from 'react';
import { Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
 
const ProductImageGallery = ({ selectedImage, images, onSelectImage }) => {
  const [openZoom, setOpenZoom] = useState(false);
 
  const handleImageClick = () => {
    if (selectedImage) setOpenZoom(true);
  };
 
  const handleCloseZoom = () => {
    setOpenZoom(false);
  };
 
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            cursor: selectedImage ? 'zoom-in' : 'default',
            alignSelf: 'center',
            width: '100%',
            textAlign: 'center',
          }}
          onClick={handleImageClick}
        >
          <img
            src={selectedImage || '/placeholder.png'}
            alt="Main"
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 8,
              objectFit: 'contain',
              backgroundColor: '#f0f0f0',
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder.png';
            }}
          />
        </div>
 
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            justifyContent: 'flex-start',
            whiteSpace: 'nowrap',
          }}
        >
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img.imageUrl || '/placeholder.png'}
              alt={`Thumbnail ${idx}`}
              style={{
                width: 70,
                height: 70,
                objectFit: 'cover',
                border:
                  selectedImage === img.imageUrl
                    ? '2px solid #000'
                    : '1px solid #ccc',
                cursor: 'pointer',
                borderRadius: 4,
                flexShrink: 0,
              }}
              onClick={() => onSelectImage(img.imageUrl)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder.png';
              }}
            />
          ))}
        </div>
      </div>

      <Modal
        open={openZoom}
        onCancel={handleCloseZoom}
        footer={null}
        centered
        closeIcon={<CloseOutlined />}
        width={800}
      >
        <img
          src={selectedImage}
          alt="Zoomed"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: 8,
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder.png';
          }}
        />
      </Modal>
    </>
  );
};
 
export default ProductImageGallery;
 