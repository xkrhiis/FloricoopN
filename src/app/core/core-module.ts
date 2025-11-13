import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule, // <-- importante
  ],
  exports: [
    HttpClientModule, // exporta para que el resto de la app lo tenga disponible
  ]
})
export class CoreModule {}




