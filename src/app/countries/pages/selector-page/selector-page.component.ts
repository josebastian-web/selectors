import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, Observable, switchMap, tap } from 'rxjs';

import { Region, SmallCountry } from '../../interfaces/country.interfaces';

import { CountriesService } from '../../services/countries.service';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
})
export class SelectorPageComponent implements OnInit{

  private fb: FormBuilder = inject(FormBuilder);

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];
  public myform: FormGroup = this.fb.group({
    region: [ '', Validators.required ],
    country: [ '', Validators.required ],
    border: [ '', Validators.required ],
  });

  constructor( private countriesService:CountriesService ) {}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChanged(): void {
    this.myform.get('region')!.valueChanges
    .pipe(
      tap( () => this.myform.get('country')!.setValue('')),
      tap( () => this.borders = []),
      switchMap( region => this.countriesService.getCountriesByRegion(region)),
    )
    .subscribe( countries => {
      this.countriesByRegion = countries;
    });
  }

  onCountryChanged(): void {
    this.myform.get('country')!.valueChanges
    .pipe(
      tap( () => this.myform.get('border')!.setValue('')),
      filter( (value: string) => value.length > 0),
      switchMap( alphaCode => this.countriesService.getCountryByAlphaCode(alphaCode)),
      switchMap( country => this.countriesService.getCountryBordersByCodes( country.borders )),
    )
    .subscribe( countries => {
      this.borders = countries;
    });
  }

}
