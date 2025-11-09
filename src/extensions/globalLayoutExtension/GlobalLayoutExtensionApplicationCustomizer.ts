import { Log } from "@microsoft/sp-core-library";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
} from "@microsoft/sp-application-base";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "./GlobalLayout.css";

export default class GlobalLayoutApplicationCustomizer extends BaseApplicationCustomizer<any> {
  private _headerPlaceholder: PlaceholderContent | undefined;
  private _footerPlaceholder: PlaceholderContent | undefined;
  private _isArabic: boolean = false;

  public async onInit(): Promise<void> {
    Log.info("GlobalLayout", "Initialized Custom Header/Footer");
    this.context.placeholderProvider.changedEvent.add(this, this._render);
    return Promise.resolve();
  }

  private async _render(): Promise<void> {
    const sp = spfi().using(SPFx(this.context));

    // 🧩 جلب الروابط من قائمة SharePoint
    let links: any[] = [];
    try {
      const items = await sp.web.lists
        .getByTitle("HeaderUrl")
        .items.select("Title,URL")();
      links = items;
    } catch {
      console.warn("⚠️ لم يتم العثور على قائمة HeaderUrl");
    }

    // 🎨 بناء الهيدر
    if (!this._headerPlaceholder) {
      this._headerPlaceholder =
        this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);

      if (this._headerPlaceholder?.domElement) {
        this._headerPlaceholder.domElement.innerHTML = `
          <div id="customHeader" class="customHeader ${
            this._isArabic ? "rtl" : "ltr"
          }">
            <div class="header-left">
              <img src="https://2327zs.sharepoint.com/sites/TEAMSITE/SiteAssets/logo.jpg" 
                   alt="Company Logo" 
                   class="logo" />
            </div>
            
            <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle Menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
            
            <nav class="header-links" id="headerLinks">
              ${links
                .map((l) => {
                  // ✅ دعم النوعين (Hyperlink أو Text)
                  const href = l.URL?.Url || l.URL || "#";
                  const isInternal = href.startsWith("#");
                  return `<a href="${href}" ${
                    isInternal
                      ? 'class="scroll-link"'
                      : 'target="_blank" rel="noopener noreferrer"'
                  }>${l.Title}</a>`;
                })
                .join("")}
            </nav>
            
            <button id="langToggle" class="lang-btn" aria-label="${
              this._isArabic ? "Switch to English" : "التبديل للعربية"
            }">
              ${this._isArabic ? "EN" : "عربي"}
            </button>
          </div>`;
      }

      // 🔄 تبديل اللغة + تفعيل الأحداث
      setTimeout(() => {
        // 🌐 تبديل اللغة
        const toggleBtn = document.getElementById("langToggle");
        toggleBtn?.addEventListener("click", () => {
          this._isArabic = !this._isArabic;
          this._headerPlaceholder?.domElement?.remove();
          this._headerPlaceholder = undefined;
          this._render();
        });

        // 📱 Mobile Menu Toggle
        const mobileMenuToggle = document.getElementById("mobileMenuToggle");
        const headerLinks = document.getElementById("headerLinks");

        mobileMenuToggle?.addEventListener("click", () => {
          mobileMenuToggle.classList.toggle("active");
          headerLinks?.classList.toggle("active");
        });

        // 🪄 Scroll سلس + تتبع الرابط
        const scrollLinks = document.querySelectorAll(
          ".scroll-link, .header-links a"
        );
        scrollLinks.forEach((link) => {
          link.addEventListener("click", (e) => {
            const href = (link as HTMLAnchorElement).getAttribute("href") || "";
            const title = (link as HTMLAnchorElement).textContent?.trim() || "";
            console.log("🔗 تم الضغط على الرابط:", title, href);

            if (href.startsWith("#")) {
              e.preventDefault();
              const targetId = href.substring(1);
              const target = document.getElementById(targetId);

              // 📱 إغلاق القائمة المحمولة عند النقر
              if (headerLinks?.classList.contains("active")) {
                headerLinks.classList.remove("active");
                mobileMenuToggle?.classList.remove("active");
              }

              if (target) {
                // ✅ Scroll سلس داخل الصفحة
                target.scrollIntoView({ behavior: "smooth", block: "start" });

                // ✅ تحديث الـ URL
                history.pushState(null, "", href);

                // ✨ تمييز العنصر الهدف مؤقتًا
                target.classList.add("highlight-section");
                setTimeout(
                  () => target.classList.remove("highlight-section"),
                  1500
                );
              } else {
                console.warn("⚠️ Element not found for id:", targetId);
              }
            } else {
              // 📱 إغلاق القائمة عند فتح رابط خارجي
              if (headerLinks?.classList.contains("active")) {
                headerLinks.classList.remove("active");
                mobileMenuToggle?.classList.remove("active");
              }
            }
          });
        });

        // 🔒 إغلاق القائمة عند النقر خارجها
        document.addEventListener("click", (e) => {
          const target = e.target as HTMLElement;
          if (
            !target.closest(".header-links") &&
            !target.closest(".mobile-menu-toggle") &&
            headerLinks?.classList.contains("active")
          ) {
            headerLinks.classList.remove("active");
            mobileMenuToggle?.classList.remove("active");
          }
        });

        // 📏 إغلاق القائمة عند تغيير حجم الشاشة
        window.addEventListener("resize", () => {
          if (
            window.innerWidth > 768 &&
            headerLinks?.classList.contains("active")
          ) {
            headerLinks.classList.remove("active");
            mobileMenuToggle?.classList.remove("active");
          }
        });
      }, 200);
    }

    // 🦶 Footer محسّن
    if (!this._footerPlaceholder) {
      this._footerPlaceholder =
        this.context.placeholderProvider.tryCreateContent(
          PlaceholderName.Bottom
        );

      if (this._footerPlaceholder?.domElement) {
        this._footerPlaceholder.domElement.innerHTML = `
          <div class="customFooter" id="footerInfo">
            <p>© ${new Date().getFullYear()} ${
          this._isArabic ? "جميع الحقوق محفوظة" : "All Rights Reserved"
        }</p>
          </div>`;
      }
    }
  }
}
