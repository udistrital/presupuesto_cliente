import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Rubro } from '../../../@core/data/models/rubro';
import { ApropiacionHelper } from '../../../@core/helpers/apropiaciones/apropiacionHelper';
// import { FuenteHelper } from '../../../@core/helpers/fuentes/fuenteHelper';
import { PopUpManager } from '../../../@core/managers/popUpManager';
import { ArbolApropiacion } from '../../../@core/data/models/arbol_apropiacion';
// import { DependenciaHelper } from '../../../@core/helpers/oikos/dependenciaHelper';
import { registerLocaleData } from '@angular/common';
import locales from '@angular/common/locales/es-CO';
import { VigenciaHelper } from '../../../@core/helpers/vigencia/vigenciaHelper';
registerLocaleData(locales, 'co');

@Component({
  selector: 'ngx-apropiaciones',
  templateUrl: './apropiaciones.component.html',
  styleUrls: ['./apropiaciones.component.scss'],
})
export class ApropiacionesComponent implements OnInit {

  @Input() vigenciaSeleccionada;
  @Output() eventChange = new EventEmitter();
  vigenciaChange: string;
  rubroSeleccionado: any;
  apropiacionData: ArbolApropiacion;
  apropiacionAprobada: boolean;
  isLeaf:              boolean;
  valorApropiacion: number;
  vigenciaSel: any;
  clean = false;
  opcion:            string;
  optionView:        string;
  productos: boolean = false;
  listaProductosAsignados = [];
  balanceado: boolean;
  allApproved: boolean;
  AreaFuncional: string;
  CentroGestor: string;
  planAdquisicionesRubro: any;
  paramsFieldsName: object;
  totalValorActividades: number;
  diferenciaActividadApropiacion: number;
  totalValorFuentes: number;
  diferenciaFuentesApropiacion: number;

  constructor(
    private apHelper:          ApropiacionHelper,
    private popManager:        PopUpManager,
    private vigenciaHelper:    VigenciaHelper
  ) {
    this.allApproved = true;
    this.optionView = 'Apropiaciones';

    this.rubroSeleccionado = {
      Id: 0,
      Codigo: '',
      Nombre: '',
      Descripcion: '',
      Hijos: '',
      Padre: '',
      ApropiacionInicial: 0,
      UnidadEjecutora: null,
      _id: '',
    };

    this.apropiacionData = {
      Vigencia: 0,
      ValorInicial: 0,
      ApropiacionAnterior: 0,
      Estado: '',
      Rubro: <Rubro>{},
      Codigo: '',
      Nombre: '',
      Descripcion: '',
      UnidadEjecutora: '',
      Padre: '',
      Hijos: [],
      Productos: []
    };

  }


  ngOnInit() {
    this.vigenciaHelper.getCurrentVigencia().subscribe(res => {
      this.vigenciaSel = res;
    });
  }

  receiveMessage($event) {
    if ($event.Hijos.length === 0) {
      this.isLeaf = true;
      this.rubroSeleccionado = <ArbolApropiacion>$event;
      this.rubroSeleccionado.Id = parseInt(this.rubroSeleccionado.Id, 0);
      this.rubroSeleccionado.Nombre = this.rubroSeleccionado.Nombre;
      this.CentroGestor = '230';
      this.AreaFuncional = '0' + this.rubroSeleccionado.UnidadEjecutora + '-Rector';
      this.rubroSeleccionado.UnidadEjecutora = parseInt(
        this.rubroSeleccionado.UnidadEjecutora,
        0,
      );
      this.rubroSeleccionado.ValorInicial = this.rubroSeleccionado.ValorInicial ? parseInt(this.rubroSeleccionado.ValorInicial, 0) : 0;

      this.valorApropiacion = this.rubroSeleccionado.ValorInicial;
      if (this.rubroSeleccionado.Estado === 'registrada') {
        this.productos = true;
      }
      this.listaProductosAsignados = this.rubroSeleccionado.Productos;
    } else {
      this.isLeaf = false;
      this.productos = false;
    }
  }

  aprobarApropiacion() {
    this.popManager.showAlert('warning', 'Aprobar Apropiación', '¿Está seguro?')
      .then((result) => {
        if (result.value) {
          this.apHelper.apropiacionApprove({ UnidadEjecutora: '1', Vigencia: this.vigenciaSel }).subscribe((res) => {
            if (res) {
              this.popManager.showSuccessAlert('Aprobación exitosa para la apropiación ' + this.vigenciaSel);
              this.cleanForm(true);
              this.eventChange.emit(true);
              this.allApproved = true;
            }
          });
        }
      },
      );
    this.apropiacionAprobada = true;
  }


  cleanForm(full?: boolean) {
    this.clean = !this.clean;
    this.rubroSeleccionado = {
      Id: 0,
      Codigo: '',
      Nombre: '',
      Descripcion: '',
      Hijos: '',
      Padre: '',
      ApropiacionInicial: 0,
      UnidadEjecutora: null,
      _id: '',
    };
    this.apropiacionData = <ArbolApropiacion>{};
    this.valorApropiacion = 0;
    if (full) {
      this.isLeaf = false;
    }
  }

  preAsignarApropiacion() {
    this.apropiacionData.Vigencia = typeof this.vigenciaSel === 'undefined' ? undefined : parseInt(this.vigenciaSel, 0);
    this.apropiacionData.Codigo = typeof this.rubroSeleccionado.Codigo === 'undefined' ? undefined : this.rubroSeleccionado.Codigo;
    this.apropiacionData.Nombre = typeof this.rubroSeleccionado.Nombre === 'undefined' ? undefined : this.rubroSeleccionado.Nombre;
    this.apropiacionData.Descripcion = typeof this.rubroSeleccionado.Descripcion === 'undefined' ? undefined : this.rubroSeleccionado.Descripcion;
    this.apropiacionData.UnidadEjecutora = typeof this.rubroSeleccionado.UnidadEjecutora === 'undefined' ? undefined : this.rubroSeleccionado.UnidadEjecutora;
    this.apropiacionData.Padre = typeof this.rubroSeleccionado.Padre === 'undefined' ? undefined : this.rubroSeleccionado.Padre;
    this.apropiacionData.Hijos = typeof this.rubroSeleccionado.Hijos === 'undefined' ? undefined : this.rubroSeleccionado.Hijos;
    this.apropiacionData.ValorInicial = typeof this.valorApropiacion === 'undefined' ? undefined : this.valorApropiacion;
    this.apropiacionData.ApropiacionAnterior = typeof this.rubroSeleccionado.ValorInicial === 'undefined' ? 0 : this.rubroSeleccionado.ValorInicial;
    this.apropiacionData.Estado = 'registrada'; // Estado preasignado

    if (this.vigenciaSel !== undefined) {
      this.apHelper.apropiacionRegister(this.apropiacionData).subscribe((res) => {
        if (res) {
          this.popManager.showSuccessAlert('Se registro la preasignación de apropiación correctamente!');
          // this.cleanForm();
          this.eventChange.emit(true);
          this.allApproved = false;
        }
      });
    } else {
      this.popManager.showErrorAlert('Seleccione una vigencia.');
    }


  }

  onSelect(selectedItem: any) {
    this.vigenciaSel = selectedItem;
  }

  checkComprobacion(event: { balanceado: boolean, approved: boolean }) {
    this.balanceado = event.balanceado;
  }
  cambioProductosAsignados(productosAsignados: any[]) {
    this.listaProductosAsignados = productosAsignados;
  }

}
