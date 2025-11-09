import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";

import * as strings from "CustomQuickLinksWebPartStrings";
import CustomQuickLinks from "./components/CustomQuickLinks";
import { ICustomQuickLinksProps } from "./components/ICustomQuickLinksProps";
import { spfi, SPFx } from "@pnp/sp";

export interface ICustomQuickLinksWebPartProps {
  Title: string;
  PagUrl: string;
  Lang: string;
  designStyle: string;
}

export default class CustomQuickLinksWebPart extends BaseClientSideWebPart<ICustomQuickLinksWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = "";
  private _sp: ReturnType<typeof spfi>;
  public render(): void {
    const element: React.ReactElement<ICustomQuickLinksProps> =
      React.createElement(CustomQuickLinks, {
        Title: this.properties.Title,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        designStyle: this.properties.designStyle,
        PagUrl: this.properties.PagUrl,
        Lang: this.properties.Lang,
        context: this.context,
        sp: this._sp,
      });

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit(); // ✅ لازم تنتظر السياق يتهيأ

    this._sp = spfi().using(SPFx(this.context)); // ✅ بعد ما يجهز الـ context

    const message = await this._getEnvironmentMessage();
    this._environmentMessage = message;
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app
        .getContext()
        .then((context) => {
          let environmentMessage: string = "";
          switch (context.app.host.name) {
            case "Office": // running in Office
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOffice
                : strings.AppOfficeEnvironment;
              break;
            case "Outlook": // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentOutlook
                : strings.AppOutlookEnvironment;
              break;
            case "Teams": // running in Teams
            case "TeamsModern":
              environmentMessage = this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentTeams
                : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(
      this.context.isServedFromLocalhost
        ? strings.AppLocalEnvironmentSharePoint
        : strings.AppSharePointEnvironment
    );
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty(
        "--bodyText",
        semanticColors.bodyText || null
      );
      this.domElement.style.setProperty("--link", semanticColors.link || null);
      this.domElement.style.setProperty(
        "--linkHovered",
        semanticColors.linkHovered || null
      );
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("Title", {
                  label: strings.DescriptionFieldLabel,
                }),
                PropertyPaneTextField("PagUrl", {
                  label: "PagUrl",
                  value: this.properties.PagUrl,
                }),
                PropertyPaneDropdown("Lang", {
                  label: "Language",
                  selectedKey: this.properties.Lang || "en",
                  options: [
                    { key: "en", text: "English" },
                    { key: "ar", text: "العربية" },
                  ],
                }),
                PropertyPaneDropdown("designStyle", {
                  label: "Quick Links Design",
                  selectedKey: this.properties.designStyle || "grid",
                  options: [
                    { key: "grid", text: "Grid (شبكي)" },
                    { key: "list", text: "List (قائمة)" },
                    { key: "cards", text: "Cards (بطاقات)" },
                  ],
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
