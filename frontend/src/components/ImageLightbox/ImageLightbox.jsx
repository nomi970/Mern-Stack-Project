import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ImageLightbox.css";

const ImageLightbox = ({ images, initialIndex = 0, onClose }) => {
  if (!images || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 sm:right-6 sm:top-6"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Swiper container */}
        <motion.div
          className="relative z-10 h-full w-full max-w-5xl px-4 py-16 sm:px-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            initialSlide={initialIndex}
            navigation
            pagination={{ clickable: true }}
            keyboard={{ enabled: true }}
            loop={images.length > 1}
            className="h-full w-full"
          >
            {images.map((src, i) => (
              <SwiperSlide key={i} className="flex items-center justify-center">
                <img
                  src={src}
                  alt={`Slide ${i + 1}`}
                  className="max-h-full max-w-full rounded-2xl object-contain"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur-md">
            {images.length} {images.length === 1 ? "image" : "images"}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageLightbox;
