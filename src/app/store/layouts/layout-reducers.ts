import { Action, createReducer, on } from '@ngrx/store';
import {
  LAYOUT_MODE,
  LAYOUT_POSITION_TYPES,
  LAYOUT_TOPBAR_COLOR_TYPES,
  LAYOUT_TYPES,
  LAYOUT_WIDTH_TYPES,
  PERLOADER_TYPES,
  SIDEBAR_COLOR,
  SIDEBAR_IMAGE,
  SIDEBAR_SIZE,
  SIDEBAR_VIEW,
  SIDEBAR_VISIBILITY,
} from './layout';
import {
  changeDataPreloader,
  changelayout,
  changeLayoutPosition,
  changeLayoutWidth,
  changeMode,
  changeSidebarColor,
  changeSidebarImage,
  changeSidebarSize,
  changeSidebarView,
  changeSidebarVisibility,
  changeTopbar,
} from './layout-action';

export interface LayoutState {
  LAYOUT: string;
  LAYOUT_MODE: string;
  LAYOUT_WIDTH: string;
  LAYOUT_POSITION: string;
  TOPBAR: string;
  SIDEBAR_SIZE: string;
  SIDEBAR_VIEW: string;
  SIDEBAR_COLOR: string;
  SIDEBAR_IMAGE: string;
  SIDEBAR_VISIBILITY: string;
  DATA_PRELOADER: string;
}

// IntialState
export const initialState: LayoutState = {
  LAYOUT: LAYOUT_TYPES.VERTICAL,
  LAYOUT_MODE: LAYOUT_MODE.LIGHTMODE,
  LAYOUT_WIDTH: LAYOUT_WIDTH_TYPES.FLUID,
  LAYOUT_POSITION: LAYOUT_POSITION_TYPES.FIXED,
  TOPBAR: LAYOUT_TOPBAR_COLOR_TYPES.LIGHT,
  SIDEBAR_COLOR: SIDEBAR_COLOR.DARK,
  SIDEBAR_SIZE: SIDEBAR_SIZE.LARGE,
  SIDEBAR_VIEW: SIDEBAR_VIEW.DEFAULT,
  SIDEBAR_IMAGE: SIDEBAR_IMAGE.NONE,
  SIDEBAR_VISIBILITY: SIDEBAR_VISIBILITY.SHOW,
  DATA_PRELOADER: PERLOADER_TYPES.DISABLE,
};

// Reducer
export const layoutReducer = createReducer(
  initialState,
  on(changelayout, (state, action) => ({ ...state, LAYOUT: action.layout })),
  on(changeMode, (state, action) => ({ ...state, LAYOUT_MODE: action.mode })),
  on(changeLayoutWidth, (state, action) => ({ ...state, LAYOUT_WIDTH: action.layoutWidth })),
  on(changeLayoutPosition, (state, action) => ({
    ...state,
    LAYOUT_POSITION: action.layoutPosition,
  })),
  on(changeTopbar, (state, action) => ({ ...state, TOPBAR: action.topbarColor })),
  on(changeSidebarImage, (state, action) => ({ ...state, SIDEBAR_IMAGE: action.sidebarImage })),
  on(changeDataPreloader, (state, action) => ({ ...state, DATA_PRELOADER: action.Preloader })),
  on(changeSidebarColor, (state, action) => ({ ...state, SIDEBAR_COLOR: action.sidebarColor })),
  on(changeSidebarSize, (state, action) => ({ ...state, SIDEBAR_SIZE: action.sidebarSize })),
  on(changeSidebarView, (state, action) => ({ ...state, SIDEBAR_VIEW: action.sidebarView })),
  on(changeSidebarVisibility, (state, action) => ({
    ...state,
    SIDEBAR_VISIBILITY: action.sidebarvisibility,
  })),
);

// Selector
export function reducer(state: LayoutState | undefined, action: Action) {
  return layoutReducer(state, action);
}
