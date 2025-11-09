import * as React from "react";
import { useEffect, useState } from "react";
import { IAnnouncementWebPartProps } from "./IAnnouncementWebPartProps";
import styles from "./AnnouncementWebPart.module.scss";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import WebPartWrapper from "./WebPartWrapper/WebPartWrapper";

interface IAnnouncement {
  Id: number;
  Title: string;
  Description: string;
  ImageUrl?: { Url: string };
  ExpiryDate?: string;
  IsUrgent?: boolean;
}

const AnnouncementWebPart: React.FC<IAnnouncementWebPartProps> = (props) => {
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const now = new Date();

      const items = await props.sp.web.lists
        .getByTitle("Announcements")
        .items.select("Id,Title,Description,ImageUrl,IsUrgent,ExpiryDate")();

      // ✅ فلترة الإعلانات المنتهية
      const filtered = items.filter(
        (i) => !i.ExpiryDate || new Date(i.ExpiryDate) > now
      );

      setAnnouncements(filtered);
    } catch (err: any) {
      console.error("❌ Error loading announcements:", err);
      setError("فشل في تحميل الإعلانات من SharePoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [props.Lang, props.designStyle]);

  const renderAnnouncements = () => {
    switch (props.designStyle) {
      case "list":
        return (
          <ul className={styles.listView}>
            {announcements.map((a) => (
              <li key={a.Id} className={a.IsUrgent ? styles.urgent : ""}>
                <h3>{a.Title}</h3>
                <p>{a.Description}</p>
              </li>
            ))}
          </ul>
        );

      case "grid":
        return (
          <div className={styles.gridView}>
            {announcements.map((a) => (
              <div key={a.Id} className={styles.card}>
                {a.ImageUrl && <img src={a.ImageUrl.Url} alt={a.Title} />}
                <h3>{a.Title}</h3>
                <p>{a.Description}</p>
              </div>
            ))}
          </div>
        );

      case "carousel":
        return (
          <div className={styles.carouselView}>
            {announcements.map((a, idx) => (
              <div key={idx} className={styles.slide}>
                <h3>{a.Title}</h3>
                <p>{a.Description}</p>
              </div>
            ))}
          </div>
        );

      default:
        return <p>❌ تصميم غير معروف.</p>;
    }
  };

  return (
    <WebPartWrapper
      title={props.Title || "📢 Latest Announcements"}
      loading={loading}
      error={error}
    >
      {!loading && !error && announcements.length === 0 && (
        <p>لا توجد إعلانات حالياً.</p>
      )}
      {!loading && !error && announcements.length > 0 && renderAnnouncements()}
    </WebPartWrapper>
  );
};

export default AnnouncementWebPart;
