import * as React from "react";
import styles from "./CustomQuickLinks.module.scss";

export interface ILinkCardProps {
  title: string;
  description: string;
  url: string;
  icon: string;
}

const LinkCard: React.FC<ILinkCardProps> = ({
  title,
  description,
  url,
  icon,
}) => {
  return (
    <a
      href={url}
      className={styles.linkCard}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.linkIcon}>{icon || "🔗"}</div>
      <div className={styles.linkContent}>
        <h3 className={styles.linkTitle}>{title}</h3>
        {description && <p className={styles.linkDescription}>{description}</p>}
      </div>
    </a>
  );
};

export default LinkCard;
