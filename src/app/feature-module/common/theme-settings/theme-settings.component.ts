import { Component, OnInit } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { SettingService } from '../../../shared/settings/settings.service';

@Component({
  selector: 'app-theme-settings',
  templateUrl: './theme-settings.component.html',
  styleUrl: './theme-settings.component.scss',
  standalone: false,
})
export class ThemeSettingsComponent implements OnInit {
  public routes = routes;
  layoutMode = '1';
  layoutWidth = '1';
  cardStyle = '1';
  sidebarColor = '1';
  dynamicSidebarColor = '';
  themeColor = '1';
  sidebarSize = '1';
  isLoader = '1';
  primaryColor = '1';
  primaryColor1 = '1';
  topbarColor2 = '1';
  topbarColor3 = '1';
  topbarColor4 = '1';
  topbarColor = 'white';
  topbarImage = '1';
  sidebarImage = '1';
  selectedColor = '84, 109, 254, 1';
  selectedColor1 = '84, 109, 254, 1'; // Default HEX color
  horizontalColor = '84, 109, 254, 1';
  dthemeColor = '84, 109, 254, 1';
  rgbaValues = '84, 109, 254, 1'; // Default RGBA values without "rgba()"
  rgbaValues1 = '84, 109, 254, 1';
  rgbaValues2 = '84, 109, 254, 1';
  rgbaValues3 = '84, 109, 254, 1';

  constructor(public settings: SettingService) {
    this.settings.layoutMode.subscribe((res: string) => {
      this.layoutMode = res;
    });
    this.settings.layoutWidth.subscribe((res: string) => {
      this.layoutWidth = res;
    });
    this.settings.cardStyle.subscribe((res: string) => {
      this.cardStyle = res;
    });
    this.settings.sidebarColor.subscribe((res: string) => {
      this.sidebarColor = res;
    });
    this.settings.themeColor.subscribe((res: string) => {
      this.themeColor = res;
    });
    this.settings.sidebarSize.subscribe((res: string) => {
      this.sidebarSize = res;
    });
    this.settings.isLoader.subscribe((res: string) => {
      this.isLoader = res;
    });
    this.settings.primaryColor.subscribe((res: string) => {
      this.primaryColor = res;
    });
    this.settings.topbarColor.subscribe((res: string) => {
      this.topbarColor = res;
    });
    this.settings.sidebarImage.subscribe((res: string) => {
      this.sidebarImage = res;
    });
    this.settings.topbarImage.subscribe((res: string) => {
      this.topbarImage = res;
    });
    this.settings.sidebarColor2.subscribe((res: string) => {
      this.selectedColor = res;
    });
    this.settings.topbarColor2.subscribe((res: string) => {
      this.selectedColor1 = res;
    });
    this.settings.topbarColor4.subscribe((res: string) => {
      this.topbarColor4 = res;
    });
    this.settings.primaryColor1.subscribe((res: string) => {
      this.primaryColor1 = res;
    });
  }

  setColor(): void {
    this.settings.changeSidebarColor('7');
    // Convert HEX to RGBA values string without "rgba()"
    this.rgbaValues = this.hexToRgbaValues(this.selectedColor, 1); // Assuming alpha is 1
    this.settings.changeSidebarColor2(this.rgbaValues);
  }
  setColor1(): void {
    this.settings.changeTopbarColor('7');
    // Convert HEX to RGBA values string without "rgba()"
    this.rgbaValues1 = this.hexToRgbaValues(this.selectedColor1, 1); // Assuming alpha is 1
    this.settings.changeTopbarColor3(this.rgbaValues1);
  }
  sethorizontalColor(): void {
    this.settings.changeTopbarColor2('7');
    // Convert HEX to RGBA values string without "rgba()"
    this.rgbaValues2 = this.hexToRgbaValues(this.horizontalColor, 1); // Assuming alpha is 1
    this.settings.changeTopbarHorizontalColor(this.rgbaValues2);
  }

  setprimaryColor(): void {
    this.settings.changePrimaryColor('8');
    // Convert HEX to RGBA values string without "rgba()"
    this.rgbaValues3 = this.hexToRgbaValues(this.dthemeColor, 1); // Assuming alpha is 1
    this.settings.changePrimaryColor1(this.rgbaValues3);
  }

  // Function to convert HEX to RGBA values string without "rgba()"
  hexToRgbaValues(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `${r}, ${g}, ${b}`;
  }

  ngOnInit(): void {
    // Check localStorage for the settings when the component initializes
    const layout = localStorage.getItem('layoutMode') || '1';
    const layoutWidth = localStorage.getItem('layoutWidth') || '1';
    const cardStyle = localStorage.getItem('cardStyle') || '1';
    const sidebarColor = localStorage.getItem('sidebarColor') || '1';
    const themeColor = localStorage.getItem('themeColor') || '1';
    const sidebarSize = localStorage.getItem('sidebarSize') || '1';
    const isLoader = localStorage.getItem('isLoader') || '2';
    const primaryColor = localStorage.getItem('primaryColor') || '1';
    const topbarColor = localStorage.getItem('topbarColor') || 'white';
    const topbarColor2 = localStorage.getItem('topbarColor2') || '1';
    const sidebarImage = localStorage.getItem('sidebarImage') || '';
    const topbarImage = localStorage.getItem('topbarImage') || '1';
    const dynamicColorSidebar = localStorage.getItem('sidebarColor2') || '1';
    this.rgbaValues = dynamicColorSidebar;
    this.settings.changeLayoutMode(layout);
    this.settings.changeLayoutWidth(layoutWidth);
    this.settings.changeCardStyle(cardStyle);
    this.settings.changeSidebarColor(sidebarColor);
    this.settings.changeThemeColor(themeColor);
    this.settings.changeSidebarSize(sidebarSize);
    this.settings.changeLoaderState(isLoader);
    this.settings.changePrimaryColor(primaryColor);
    this.settings.changeTopbarColor2(topbarColor2);
    this.settings.changeTopbarColor(topbarColor);
    this.settings.changeSidebarImage(sidebarImage);
    this.settings.changeTopbarImage(topbarImage);
    this.settings.changeSidebarColor2(dynamicColorSidebar);
  }

  public changeLayoutMode(layout: string): void {
    this.settings.layoutMode.next(layout);
    this.settings.changeLayoutMode(layout);
    localStorage.setItem('layoutMode', layout);
  }
  public changeLayoutWidth(width: string): void {
    this.settings.layoutWidth.next(width);
    this.settings.changeLayoutWidth(width);
    localStorage.setItem('layoutWidth', width);
  }

  public changeTopbarColor(topbar: string): void {
    this.settings.topbarColor.next(topbar);
    localStorage.setItem('topbarColor', topbar);
  }
  public changeSidebarSize(sidebar: string): void {
    this.settings.sidebarSize.next(sidebar);
    localStorage.setItem('sidebarSize', sidebar);
  }

  public changeSidebarColor(sidebarColor: string): void {
    this.settings.sidebarColor.next(sidebarColor);
    localStorage.setItem('sidebarColor', sidebarColor);
  }

  resetAllMode() {
    this.settings.changeLayoutMode('1');
    this.settings.changeLayoutWidth('1');
    this.settings.changeCardStyle('1');
    this.settings.changeSidebarColor('1');
    this.settings.changeThemeColor('1');
    this.settings.changeLoaderState('2');
    this.settings.changeTopbarColor('white');
    this.settings.changeTopbarColor2('1');
    this.settings.changePrimaryColor('1');
    this.settings.changeTopbarColor('white');
    this.settings.changeSidebarSize('1');
    this.settings.changeTopbarImage('');
    this.settings.changeSidebarImage('');
    this.rgbaValues = '84, 109, 254, 1';
  }
}
