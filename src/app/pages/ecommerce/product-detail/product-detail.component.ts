import { Component, OnInit, ViewChild } from '@angular/core';
// Products Services
import { restApiService } from '../../../core/services/rest-api.service';

import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { productList } from 'src/app/core/data/product';
import { productListModel } from 'src/app/store/Ecommerce/ecommerce_model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  standalone: false,
})

/**
 * ProductDetail Component
 */
export class ProductDetailComponent implements OnInit {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  public productDetail!: productListModel[];
  // isImage;
  defaultSelect = 2;
  readonly = false;
  content?: any;
  products: any;

  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;

  constructor(public restApiService: restApiService) {
    this.productDetail = productList;
  }

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Product Details', active: true }];
  }

  /**
   * Swiper setting
   */
  config = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
  };

  slidesConfig = {
    // Configuration options for the ngx-slick-carousel
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
  };

  slickChange(event: any) {
    const swiper = document.querySelectorAll('.swiperlist');
  }

  slidePreview(id: any, event: any) {
    const swiper = document.querySelectorAll('.swiperlist');
    swiper.forEach((el: any) => {
      el.classList.remove('swiper-slide-thumb-active');
    });
    event.target.closest('.swiperlist').classList.add('swiper-slide-thumb-active');
    this.slickModal.slickGoTo(id);
  }
}
