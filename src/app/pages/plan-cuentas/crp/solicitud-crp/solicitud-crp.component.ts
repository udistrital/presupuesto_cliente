import { Component, OnInit } from '@angular/core';
import { FORM_INFO_SOL_CRP } from './form_info_sol_crp';
import { SolicitudCrp } from '../../../../@core/data/models/sol_crp';
import { FormManager } from '../../../../@core/managers/formManager';
import { AdmAmazonHelper } from '../../../../@core/helpers/administrativa/admAmazonHelper';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../../@core/managers/popUpManager';
import { CRPHelper } from '../../../../@core/helpers/crp/crpHelper';
import { CDPHelper } from '../../../../@core/helpers/cdp/cdpHelper';
@Component({
  selector: 'ngx-solicitud-crp',
  templateUrl: './solicitud-crp.component.html',
  styleUrls: ['./solicitud-crp.component.scss']
})
export class SolicitudCrpComponent implements OnInit {
  info_solCrp: SolicitudCrp;
  clean = false;
  formInfoSolCrp: any;
  solCrpData: SolicitudCrp;

  constructor(
    private translate: TranslateService,
    private crpHelper: CRPHelper,
    private cdpHelper: CDPHelper,
    private popManager: PopUpManager,
    private admAmazonHelper: AdmAmazonHelper
  ) {
    this.formInfoSolCrp = FORM_INFO_SOL_CRP;
    this.construirForm();

    this.solCrpData = {
      ConsecutivoCDP: undefined,
      Vigencia: '',
      Beneficiario: '',
      Valor: undefined,
      NumeroCompromiso: undefined,
      TipoCompromiso: undefined,
      FechaCreacion: undefined
    };
  }

  ngOnInit() {
    this.info_solCrp = {} as SolicitudCrp;
    this.loadOptionsTipoDocumento();
    this.loadCDPInfo();

  }

  construirForm() {
    this.formInfoSolCrp.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formInfoSolCrp.campos.length; i++) {
      this.formInfoSolCrp.campos[i].label = this.formInfoSolCrp.campos[i].label_i18n;
      this.formInfoSolCrp.campos[i].placeholder = this.formInfoSolCrp.campos[i].label_i18n;
    }
  }

  cleanForm() {
    this.clean = !this.clean;
    this.info_solCrp = null;
    this.formInfoSolCrp.campos[FormManager.getIndexForm(this.formInfoSolCrp, 'Codigo')].prefix.value = '';

  }

  validarForm(event) {
    // tslint:disable-next-line
    const today = new Date();
    console.info(event);
    if (event.valid) {
      console.info(event);
      this.solCrpData.ConsecutivoCDP = typeof event.data.SolicitudCRP.NumeroCDP.consecutivo_cdp === 'undefined' ? undefined : event.data.SolicitudCRP.NumeroCDP.consecutivo_cdp;
      this.solCrpData.Vigencia = '2019';
      this.solCrpData.Beneficiario = typeof event.data.SolicitudCRP.TipoDocumento.Abreviatura
        && event.data.SolicitudCRP.NumeroDocumento === 'undefined' ? undefined : event.data.SolicitudCRP.TipoDocumento.Abreviatura + event.data.SolicitudCRP.NumeroDocumento;
      this.solCrpData.TipoCompromiso = typeof event.data.SolicitudCRP.TipoCompromiso.Tipo === 'undefined' ? undefined : 1;
      this.solCrpData.NumeroCompromiso = typeof event.data.SolicitudCRP.NumeroCompromiso === 'undefined' ? undefined : event.data.SolicitudCRP.NumeroCompromiso;
      this.solCrpData.FechaCreacion = new Date();

      if (event.data.MontoParcial === true) {
        this.solCrpData.Valor = typeof event.data.ValorParcial === 'undefined' ? undefined : event.data.ValorParcial;
      } else {
        this.solCrpData.Valor = 0;
      }

      console.info(this.solCrpData, 'hola');

      this.crpHelper.solCrpRegister(this.solCrpData).subscribe((res) => {
        if (res) {
          this.popManager.showSuccessAlert('Se registro la Solicitud de CRP correctamente!');
          this.cleanForm();
        }
      });
    } else {
      this.popManager.showErrorAlert('Datos Incompletos!');
    }
  }


  loadCDPInfo(): void {
    let cdpsConsecutivos: Array<any> = [];
    this.cdpHelper.getListaCDP('').subscribe(res => {
      if (res != null) {
        console.info(res);
        cdpsConsecutivos = res;
      }
      this.formInfoSolCrp.campos[this.getIndexForm('NumeroCDP')].opciones = cdpsConsecutivos;
    });
  }
  loadOptionsTipoDocumento(): void {
    let tipoDocData: Array<any> = [];
    this.admAmazonHelper.getAllTipoDocumento().subscribe(res => {
      if (res !== null) { tipoDocData = res; }
      this.formInfoSolCrp.campos[this.getIndexForm('TipoDocumento')].opciones = tipoDocData;
    });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInfoSolCrp.campos.length; index++) {
      const element = this.formInfoSolCrp.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }
}