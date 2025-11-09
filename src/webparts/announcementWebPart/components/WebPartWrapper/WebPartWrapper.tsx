import * as React from "react";
import styles from "./WebPartWrapper.module.scss";

interface IWebPartWrapperProps {
  title?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
}

const WebPartWrapper: React.FC<IWebPartWrapperProps> = ({
  title,
  children,
  loading,
  error,
}) => {
  return (
    <div className={styles.wrapper}>
      {title && <h2 className={styles.title}>{title}</h2>}

      {loading && <div className={styles.loading}>⏳ جاري التحميل...</div>}

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && <div className={styles.content}>{children}</div>}
    </div>
  );
};

export default WebPartWrapper;
