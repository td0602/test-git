import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { VModalService } from '@vnpt/oneui-ui/modal';
import { IInvoice } from '../../model/invoice.model';
import { ImportInvoiceComponent } from '../import/import-invoice.component';
import { ImportFileOcrInvoiceComponent } from '../importfile-ocr/importfileocr-invoice.component';
import { InvoiceService } from '../../service/invoice.service';
import { VNotificationService } from '@vnpt/oneui-ui/notification';
import { DatePipe } from '@angular/common';
import { CreateInvoiceComponent } from '../create-edit/create-invoice.component';
import { TagColor, TagInvoiceComponent } from '../tag/tag-invoice.component';
import { ViewDetailComponent } from '../view-detail/view-detail.component';
import { VTableQueryParams } from '@vnpt/oneui-ui/table';
import { TagInvoiceService } from '../../service/tag-invoice.service';
import {
  IInvoiceConvert,
  InvoiceConvert,
} from '../../model/invoice-convert.models';
import * as FileSaver from 'file-saver';
import { AccountService } from 'commonLibrary';
import { Org } from '../../model/org.model';
import { CompanyService } from '../../service/company.service';
import { InvSyncService } from '../../service/invoice-sync.service';
import { InvDuplicateComponent } from '../inv-duplicate/inv-duplicate.component';
import { CompareTaxComponent } from '../compare-tax/compare-tax.component';
import { PDFDocument } from 'pdf-lib';
import { PdfService } from '../../service/pdf.service';
import { environment } from '../../../../environments/environment';
import * as EVN from '../../../../../../../start/src/environments/environment';
import { ChangeDetectorRef } from '@angular/core';
import { SendEmailComponent } from '../sendemail/sendemail.component';
import * as moment from 'moment';
import { Title } from '@angular/platform-browser';
import { AutoConfigService } from '../../service/auto-config.service';
import { IAutoConfig } from '../../model/auto-config.model';
import { IInputExtra } from '../../model/inputExtra.model';
import { PaymentService } from '../../service/payment.service';
import { IPayment } from '../../model/payment.model';
import { GridConfig, IColumn } from '../../model/grid-config.model';
import { GridConfigsService } from '../../service/grid-config.service';
import {
  PERMISSION_PRINT_MULTI,
  PERMISSION_PRINT_ONE,
  RESPONSE_CODE_SUCCESS,
} from '../../../commons/constants';
import { PackageConfigService } from '../../service/package-config.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})
export class InvoiceComponent implements OnInit {
  tagColor = TagColor;
  isLoading = false;
  page: number = 1;
  size: number = 10;
  total: number = 1;
  totalCompany: number = 0;
  totalParent: number = 1;
  isExport = false;
  pageParent = 1;
  userTeller: string[] = [];
  reason: string[] = [];
  datePipe = new DatePipe('vi');
  invoices: any[] = [];
  listCompany: IInvoice[] = [];
  selectedInvs: IInvoice[] = [];
  invoice: IInvoiceConvert = null;
  currentInvoice: IInvoiceConvert = null;
  invoiceExport: IInvoiceConvert = null;
  mst: any;
  ismst: any;
  khms: null;
  status = null;
  tag = null;
  NBan = null;
  radioValue = 'A';
  radioValue2 = 'C';
  radioValue3 = 'E';
  radioOtherValue = 'other';
  status_approver = null;
  invOrigin = null;
  company: '';
  listSA: any[] = [
    { value: '1', label: 'Chưa duyệt' },
    { value: '2', label: 'Từ chối duyệt' },
    { value: '3', label: 'Đã duyệt' },
    { value: '5', label: 'Chờ duyệt lại' },
  ];
  listInvOrigin: any[] = [
    { value: '0', label: 'Nhập thủ công' },
    { value: '1', label: 'Từ cơ quan thuế' },
    { value: '2', label: 'Từ NCC VNPT' },
    { value: '3', label: 'Từ email' },
  ];
  listS: any[] = [
    { value: '0', label: 'Không Hợp lệ' },
    { value: '1', label: 'Hợp lệ' },
  ];
  listFormat: any[] = [
    { value: '0', label: 'Hóa đơn có mã của CQT' },
    { value: '1', label: 'Hóa đơn không có mã của CQT' },
    { value: '2', label: 'Hóa đơn có mã khởi tạo từ MTT' },
  ];

  statusTypes: any[] = [
    { value: '1', label: 'Hóa đơn gốc' },
    { value: '2', label: 'Hóa đơn thay thế' },
    { value: '3', label: 'Hóa đơn điều chỉnh' },
    { value: '4', label: 'Hóa đơn bị thay thế' },
    { value: '5', label: 'Hóa đơn bị điều chỉnh' },
    { value: '6', label: 'Hóa đơn hủy' },
  ];
  statusType = null;

  fromDate: Date = new Date(new Date().getTime() - 30 * 86400000);
  toDate: Date = new Date();
  approvingDate: Date;
  isVisibleDetail = false;
  checkedAll = false;
  setOfCheckedId = new Set<string>();
  setOfCheckedApprover = new Set<string>();
  idDelete: string;
  typeDelete: number;
  idApprover: string;
  listTag = [];
  isCheckz = true;
  tags = null;
  paymentStatus: number;
  format: number;
  isSaCheck: string;
  isVisibleDelete = false;
  isVisibleApprover = false;
  isVisibleApprover2 = false;
  isVisibleReason = false;
  isCheck = false;
  isCheckExport = null;
  titleValue = 'other';
  exportFile = null;
  listIdDelete: Array<String> = [];
  listIdApprover: Array<string> = [];
  IdApprover: Array<string> = [];
  selectedApproval = null;
  ischeckrole: any;
  currentPage = 1;
  isapprover = false;
  isapprover2 = false;
  isVisibleImportError = false;
  importErrors = [];

  invDuplicateCount = 0;
  isCompareWithTax = false;
  isProgressCompare = false;
  isProgressDelete = false;
  printSelected = [];
  isPrinting = false;
  cssPrint: string = '';
  daysOfMonth: number = 92;
  componentTitle: string = 'Danh sách hóa đơn đầu vào';
  MST: string = '';
  fixColNumber: number = 5;

  // Duonglt: Task config danh sach hien thi
  public isConfig = false;
  public columns: IColumn[] = [];
  public extraColumns: any[] = [];
  public autoConfig: any;
  private inputCurrentData: string = '';
  private inputCurrentID: string = '';
  private inputCurrentPosition: number = 0;
  private itemOnEdit: string;
  public listPayment: IPayment[];
  public editId: string | null = null;
  public editPayment: string | null = null;
  public editExtra: string | null = null;
  public extras: string[] = [
    'extra1',
    'extra2',
    'extra3',
    'extra4',
    'extra5',
    'extra6',
    'extra7',
    'extra8',
    'extra9',
    'extra10',
  ];
  public isAdv: boolean = false;
  public invoiceMoney: any;
  // package 0d
  public isColumnConfig: boolean = false;
  public isViewDateConfig: boolean = false;
  public isColumnConfigNoti: string;

  constructor(
    private notification: VNotificationService,
    private modal: VModalService,
    private viewContainerRef: ViewContainerRef,
    private invoiceService: InvoiceService,
    private tagService: TagInvoiceService,
    private accountService: AccountService,
    private companyService: CompanyService,
    private invSyncService: InvSyncService,
    private pdfService: PdfService,
    private changeDetectorRef: ChangeDetectorRef,
    private titleService: Title,
    private gridConfigsService: GridConfigsService,
    private packConfService: PackageConfigService,
    private autoConfigService: AutoConfigService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.titleService.setTitle(`VNPT Invoice - ${this.componentTitle}`);
    this.printSelected = [];
    this.onSearch();
    this.getTotalSync();
    this.getTag();
    // package 0d
    this.checkColumnConfig();
    this.checkViewDateConfig();
    this.loadCompany(true);
    this.ischeckrole = this.accountService.getAccount();
    for (let i = 0; i < this.ischeckrole.roles.length; i++) {
      if (this.ischeckrole.roles[i] == 'INVOICE:UPDATE-LIST:INBOT') {
        this.isapprover = true;
      }
    }

    this.gridConfigsService
      .getGridConfigUser({ table: 'INBOT' })
      .subscribe((res) => {
        if (res.body && res.body.content) {
          this.columns = res.body.content
            .sort((a, b) => a.position - b.position)
            .filter(
              (item) =>
                !['mauSo', 'soHoaDon', 'kyHieu', 'maSoThueNguoiBan'].includes(
                  item.field
                )
            );
        }
        this.getExtraColumns();
      });

    this.paymentService.getAll().subscribe((res) => {
      if (res && res.body) {
        this.listPayment = res.body.content;
      }
    });
  }

  getExtraColumns(): void {
    this.autoConfigService
      .query(this.accountService.getAccount().orgCode)
      .subscribe((res) => {
        if (res != null && res.body.content) {
          this.autoConfig = res.body.content;
          this.extraColumns = this.autoConfig?.extra;
          if (this.extraColumns != null) {
            this.columns = this.columns.concat(
              this.formatExtraToCol(this.extraColumns)
            );
          }
        }
      });
  }

  formatExtraToCol(A: any[]): IColumn[] {
    return A.map((element) => {
      const formattedObject: IColumn = {
        field: element.field,
        title: element.title,
        activated: element.activated,
        display: false,
        delegate: false,
        position:
          element.position +
          Math.max(...this.columns.map((column) => column.position)),
        type: null,
        map: {},
        formattedDate: null,
      };

      return formattedObject;
    });
  }

  formatColToExtra(A: any[]): any[] {
    return A.map((element, index) => {
      const formattedObject: any = {
        field: element.field,
        title: element.title,
        activated: element.activated,
        position: index + 1,
      };

      return formattedObject;
    });
  }

  getTotalSync(): void {
    this.invSyncService.getTotalSync().subscribe((res) => {
      if (res.body.err_code == 0) {
        if (res.body.content != null) {
          this.invDuplicateCount = res.body.content.totalDuplicate;
        }
      } else {
        this.notification.create(
          'error',
          'Lỗi kiểm tra hóa đơn trùng lặp trên CQT!',
          '',
          { vPlacement: 'bottomRight' }
        );
      }
    });
  }

  showModalAdd(): void {
    const modal = this.modal.create({
      vTitle: 'Thêm hóa đơn đầu vào',
      vContent: CreateInvoiceComponent,
      vWidth: '1300px',
      vViewContainerRef: this.viewContainerRef,
      vComponentParams: {},
      vFooter: null,
      vMaskClosable: false,
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.data === '1') {
        this.loadPage(1);
        this.loadMoney(1);
      }
    });
  }

  getTag(): void {
    const org: Org = {
      org_code: this.accountService.getAccount().orgCode,
      org_id: this.accountService.getAccount().orgId,
    };
    this.tagService.query(org).subscribe((res) => {
      if (res.body.err_code == 0 && res.body.content != null) {
        this.listTag = res.body.content;
      } else {
        this.tags = [];
      }
    });
  }

  showModalEdit(data): void {
    const modal = this.modal.create({
      vTitle: 'Chỉnh sửa hóa đơn đầu vào',
      vContent: CreateInvoiceComponent,
      vWidth: '1300px',
      vViewContainerRef: this.viewContainerRef,
      vComponentParams: {
        invoiceID: data.id,
        isEdit: true,
        extra1: data.extra1 ? data.extra1 : null,
        extra2: data.extra2 ? data.extra2 : null,
        extra3: data.extra3 ? data.extra3 : null,
        extra4: data.extra4 ? data.extra4 : null,
        extra5: data.extra5 ? data.extra5 : null,
        extra6: data.extra6 ? data.extra6 : null,
        extra7: data.extra7 ? data.extra7 : null,
        extra8: data.extra8 ? data.extra8 : null,
        extra9: data.extra9 ? data.extra9 : null,
        extra10: data.extra10 ? data.extra10 : null,
        paymentStatus: data.paymentStatus ? data.paymentStatus : null,
      },
      vFooter: null,
      vMaskClosable: false,
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.data === '1') {
        this.loadPage(this.page);
        this.loadMoney(this.page);
      }
    });
  }

  showModalImport(): void {
    const modal = this.modal.create({
      vTitle: 'Import hóa đơn đầu vào',
      vContent: ImportInvoiceComponent,
      vWidth: '480px',
      vViewContainerRef: this.viewContainerRef,
      vComponentParams: {
        importMode: 'A',
        checkFormImport: 'A',
      },
      vFooter: null,
      vMaskClosable: false,
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.data) {
        this.loadPage(1);
        this.loadMoney(1);
        this.loadCompany(true);
        // if (result.data != '1') {
        //   this.isVisibleImportError = true;
        //   this.importErrors = result.data;
        // }
      }
    });
  }

  showModalOCR(): void {
    const modal = this.modal.create({
      vTitle: 'Thêm file hóa đơn đầu vào',
      vContent: ImportFileOcrInvoiceComponent,
      vWidth: '480px',
      vViewContainerRef: this.viewContainerRef,
      vComponentParams: {},
      vFooter: null,
      vMaskClosable: false,
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.data === '1') {
        this.loadPage(1);
        this.loadMoney(1);
      }
    });
  }

  showModalExport() {
    this.isExport = true;
  }

  handleCancelExport() {
    this.isExport = false;
    this.resetOptionExcel();
  }

  handleCancelDetail() {
    this.isVisibleDetail = false;
  }

  handleCancelApprover() {
    this.isVisibleApprover = false;
  }

  handleCancelApprover2() {
    this.isVisibleApprover2 = false;
  }

  handleCancelImportError() {
    this.isVisibleImportError = false;
  }

  loadPage(page: number): void {
    this.isLoading = true;
    this.getTag();
    if (this.invoice == null) {
      this.invoice = {};
    }
    this.invoiceService
      .query(this.invoice, { page: page - 1, size: this.size })
      .subscribe(
        (res) => {
          if (res != null && res.body.content) {
            this.invoices = res.body.content;
            this.total = res.body.totalElements;
            this.page = page;
            this.MST = this.invoices[0].org_code;
            for (let i = 0; i < this.size; i++) {
              if (this.invoices[i] != null) {
                this.invoices[i].ttchung.shdon = this.decodeInvoiceNo(
                  this.invoices[i].ttchung?.shdon
                );
              }
            }
          }
          this.isLoading = false;
          this.checkedAllStatus();
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  loadMoney(page: number): void {
    this.isLoading = true;
    this.getTag();
    if (this.invoice == null) {
      this.invoice = {};
    }
    this.invoiceService
      .queryMoney(this.invoice, { page: page - 1, size: this.size })
      .subscribe(
        (res) => {
          if (res != null && res.body.content) {
            this.invoiceMoney = res.body.content;
            this.page = page;
          }
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  private decodeInvoiceNo(invoiceNo: string): String {
    if (invoiceNo == null) return null;

    if (invoiceNo.length >= 8) return invoiceNo;

    let countAppend = 8 - invoiceNo.length;
    let zero: String = '';
    for (let index = 0; index < countAppend; index++) {
      zero += '0';
    }
    return zero.concat(invoiceNo);
  }

  loadCompany(isFirst?: boolean): void {
    this.companyService
      .queryAll({ count: '-1' }, { page: this.currentPage - 1, size: 1000 })
      .subscribe(
        (res) => {
          if (res != null && res.body.content) {
            if (isFirst) {
              this.listCompany = res.body.content;
            } else {
              this.listCompany = this.listCompany.concat(res.body.content);
            }
            this.totalCompany = res.body.totalElements;
          }
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  // package 0d
  checkColumnConfig(): void {
    this.invoiceService.checkColumnConfig().subscribe((res) => {
      if (res != null && res?.body) {
        if (res?.body?.statusConfig) {
          this.isColumnConfig = true;
        } else {
          this.isColumnConfigNoti = 'Vui lòng đăng ký gói cước chính thức để sử dụng chức năng này!';
          this.isColumnConfig = false;
        }
      }
    });
  }

  // package 0d
  checkViewDateConfig(): void {
    this.invoiceService.checkViewDateConfig().subscribe((res) => {
      if (res != null && res?.body) {
        if (res?.body?.statusConfig) {
          this.isViewDateConfig = true;
        } else {
          this.isViewDateConfig = false;
        }
      }
    });
  }

  scrollToBottom(): void {
    if (this.totalCompany > this.listCompany.length) {
      this.isLoading = true;
      this.currentPage = this.currentPage + 1;
      this.loadCompany();
    }
  }

  showModalDetail(data): void {
    const modal = this.modal.create({
      vContent: ViewDetailComponent,
      vWrapClassName: 'fullw',
      vWidth: '100%',
      vViewContainerRef: this.viewContainerRef,
      vComponentParams: {
        id: data.id,
        isVisibleDetail: this.isVisibleDetail,
      },
      vFooter: null,
    });

    modal.afterClose.subscribe((result) => {
      this.loadPage(this.page);
      this.loadMoney(this.page);
    });
  }

  onChangeCompany($event): void {
    this.NBan = $event;
  }

  onSearch(): void {
    this.selectedInvs = [];
    this.setOfCheckedId.clear();
    this.checkedAll = false;

    this.invoice = new InvoiceConvert();
    // Check null các trường nhập thời gian
    if (!this.toDate || !this.fromDate) {
      this.notification.create(
        'error',
        '',
        'Yêu cầu nhập Ngày hóa đơn (Từ ngày/Đến ngày)',
        { vPlacement: 'bottomRight', vStyle: { width: '400px' } }
      );
      return;
    }
    // Check Từ ngày phải nhỏ hơn hoặc bằng đến ngày
    const fromDateFormatted = moment(this.fromDate).format('YYYY-MM-DD');
    const toDateFormatted = moment(this.toDate).format('YYYY-MM-DD');
    const diffInDays = moment(this.toDate).diff(this.fromDate, 'days');

    if (toDateFormatted < fromDateFormatted) {
      this.notification.create(
        'error',
        '',
        'Từ ngày phải nhỏ hơn hoặc bằng đến ngày',
        { vPlacement: 'bottomRight', vStyle: { width: '400px' } }
      );
      return;
    }
    // Check khoảng thời gian nhập phải nhỏ hơn hoặc bằng 30 ngày
    if (diffInDays > this.daysOfMonth) {
      this.notification.create(
        'error',
        'Khoảng thời gian vượt quá 3 tháng, vui lòng chọn lại',
        '',
        { vPlacement: 'bottomRight', vStyle: { width: '400px' } }
      );
      return;
    }

    if (this.fromDate != null) {
      this.invoice.fromDate = this.datePipe.transform(
        this.fromDate,
        'dd/MM/yyyy'
      );
    }
    if (this.toDate != null) {
      this.invoice.toDate = this.datePipe.transform(this.toDate, 'dd/MM/yyyy');
    }
    if (this.approvingDate != null) {
      this.invoice.approvingDate = this.datePipe.transform(
        this.approvingDate,
        'dd/MM/yyyy'
      );
    }
    this.invoice.ndhdon = {};
    this.invoice.ndhdon.nban = {};
    this.invoice.ndhdon.nban.ten = this.NBan;
    this.invoice.ndhdon.nban.mst = this.mst;
    this.invoice.status = this.status;
    this.invoice.statusType = this.statusType;
    this.invoice.listsa = this.status_approver;
    this.invoice.listInvOrigin = this.invOrigin;
    this.invoice.ttchung = {};
    this.invoice.ttchung.khmshdon = this.khms;
    this.invoice.ttchung.khhdon = this.khms;
    this.invoice.ttchung.shdon = parseInt(this.khms, 10).toString();
    this.invoice.tag = [];
    if (this.tags != null) {
      for (let i = 0; i < this.tags.length; i++) {
        this.invoice.tag[i] = {};
        this.invoice.tag[i].TagName = this.tags[i];
      }
    }
    this.invoice.paymentStatus = this.paymentStatus;
    this.invoice.format = this.format;
    this.currentInvoice = this.invoice;
    this.loadPage(1);
    this.loadMoney(1);
  }

  formatExportOther(): any {
    let invoiceOtherDTO: {};
    const excludedFields = ['mauSo', 'soHoaDon', 'kyHieu', 'maSoThueNguoiBan'];
    if (this.extraColumns != null) {
      const fixColExtraNumber = this.columns
        .filter((itemCol) => {
          return !this.extraColumns.some(
            (extraCol) => extraCol.field === itemCol.field
          );
        })
        .filter((itemCol) => itemCol.activated).length;
      invoiceOtherDTO = {
        invoiceDTO: this.currentInvoice,
        colTypeDTO: this.columns
          .filter((item) => !excludedFields.includes(item.field))
          .filter((itemCol) => {
            return !this.extraColumns.some(
              (extraCol) => extraCol.field === itemCol.field
            );
          })
          .filter((itemCol) => itemCol.activated)
          .map(
            (
              {
                activated,
                delegate,
                display,
                field,
                formattedDate,
                map,
                type,
                ...rest
              },
              index
            ) => ({ ...rest, position: index + this.fixColNumber })
          ),
        extraTypeDTO: this.columns
          .filter((itemCol) => {
            return this.extraColumns.some(
              (extraCol) => extraCol.field === itemCol.field
            );
          })
          .filter((itemCol) => itemCol.activated)
          .map(
            (
              {
                activated,
                delegate,
                display,
                formattedDate,
                map,
                type,
                ...rest
              },
              index
            ) => ({
              ...rest,
              position: index + this.fixColNumber + fixColExtraNumber,
            })
          ),
      };
    } else {
      invoiceOtherDTO = {
        invoiceDTO: this.currentInvoice,
        colTypeDTO: this.columns
          .filter((item) => !excludedFields.includes(item.field))
          .filter((itemCol) => itemCol.activated)
          .map(
            (
              {
                activated,
                delegate,
                display,
                field,
                formattedDate,
                map,
                type,
                ...rest
              },
              index
            ) => ({ ...rest, position: index + this.fixColNumber })
          ),
        extraTypeDTO: [],
      };
    }
    return invoiceOtherDTO;
  }

  onExportOther(): void {
    const requestData = this.formatExportOther();
    const fileName = `${this.MST}_Danhsachhoadon.xlsx`;
    this.isLoading = true;
    this.invoiceService
      .exportOther(requestData, {
        page: 0,
        size: 3000,
      })
      .subscribe(
        (res) => {
          if (res.size > 0) {
            const blobURL = window.URL.createObjectURL(res);
            const tempLink = document.createElement('a');
            tempLink.style.display = 'none';
            tempLink.href = blobURL;
            tempLink.setAttribute('download', fileName);
            if (typeof tempLink.download === 'undefined') {
              tempLink.setAttribute('target', '_blank');
            }
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            setTimeout(() => {
              window.URL.revokeObjectURL(blobURL);
            }, 100);
          } else {
            this.notification.create(
              'error',
              'Dữ liệu quá lớn, vui lòng chọn lại thời gian tìm kiếm',
              '',
              { vPlacement: 'bottomRight' }
            );
          }
          this.resetOptionExcel();
          this.isLoading = false;
          this.isExport = false;
        },
        // () => {
          // package 0d
          (err) => {
            const errorMessages: Record<number, string> = {
              900: 'Không lấy được thông tin gói cước!',
              901: 'Vui lòng đăng ký gói cước chính thức để sử dụng chức năng này!',
            };

            const title =
              errorMessages[err.status] ||
              'Dữ liệu quá lớn, vui lòng chọn lại thời gian tìm kiếm';
            const content = '';
            this.notification.create('error', title, content, {
              vPlacement: 'bottomRight',
            });
          this.isLoading = false;
          this.isExport = false;
          // package 0d
          // this.notification.create(
          //   'error',
          //   'Dữ liệu quá lớn, vui lòng chọn lại thời gian tìm kiếm',
          //   '',
          //   { vPlacement: 'bottomRight' }
          // );
        }
      );
  }

  onExport(): void {
    if (this.titleValue?.length > 0) {
      switch (this.titleValue) {
        case 'misa':
          if (this.isCheckExport == 'B') {
            this.exportFile = 'Misa_DV';
          } else {
            this.exportFile = 'Misa_HH';
          }
          break;

        case 'fast':
          if (this.isCheckExport == 'D') {
            this.exportFile = 'Fast_DV';
          } else {
            this.exportFile = 'Fast_HH';
          }
          break;

        case 'smart':
          if (this.isCheckExport == 'F') {
            this.exportFile = 'Smart_dv';
          } else {
            this.exportFile = 'Smart_HH';
          }
          break;
      }
    } else {
      switch (this.isCheckExport) {
        case 'B':
          this.exportFile = 'Misa_DV';
          break;
        default:
          this.exportFile = 'Misa_HH';
          break;
      }
    }

    this.invoiceExport = new InvoiceConvert();
    if (this.toDate < this.fromDate && this.toDate != null) {
      this.notification.create(
        'error',
        '',
        'Từ ngày phải nhỏ hơn hoặc bằng đến ngày',
        {
          vPlacement: 'bottomRight',
        }
      );
      return;
    }
    if (this.fromDate != null) {
      this.invoiceExport.fromDate = this.datePipe.transform(
        this.fromDate,
        'dd/MM/yyyy'
      );
    }
    if (this.toDate != null) {
      this.invoiceExport.toDate = this.datePipe.transform(
        this.toDate,
        'dd/MM/yyyy'
      );
    }
    if (this.approvingDate != null) {
      this.invoiceExport.approvingDate = this.datePipe.transform(
        this.approvingDate,
        'dd/MM/yyyy'
      );
    }

    this.invoiceExport.ndhdon = {};
    this.invoiceExport.ndhdon.nban = {};
    if (this.NBan != null) {
      this.invoiceExport.ndhdon.nban.ten = this.NBan;
    }
    if (this.mst != null) {
      this.invoiceExport.ndhdon.nban.mst = this.mst;
    }
    this.invoiceExport.status = this.status;
    this.invoiceExport.statusType = this.statusType;
    this.invoiceExport.listsa = this.status_approver;
    this.invoiceExport.ttchung = {};
    this.invoiceExport.ttchung.khmshdon = this.khms;
    this.invoiceExport.ttchung.khhdon = this.khms;
    this.invoiceExport.ttchung.shdon = this.khms;
    this.invoiceExport.tag = [];
    this.invoiceExport.tag[0] = {};
    if (
      this.isCheckExport == null ||
      this.isCheckExport == 'A' ||
      this.isCheckExport == 'C' ||
      this.isCheckExport == 'E'
    ) {
      this.invoiceExport.tag[0].TagName = 'Hàng hóa';
    }
    if (
      this.isCheckExport == 'B' ||
      this.isCheckExport == 'D' ||
      this.isCheckExport == 'F'
    ) {
      this.invoiceExport.tag[0].TagName = 'Dịch vụ';
    }
    if (this.total <= 2000) {
      const fileName = `Dshoadondauvao_${
        this.exportFile
      }_${this.datePipe.transform(new Date(), 'ddMMyyyy')}.xlsx`;
      this.isLoading = true;
      this.invoiceService
        // package 0d
        .exportALl(
          this.invoiceExport,
          this.titleValue,
          this.isCheckExport,
          null,
          {
        // .export(this.invoiceExport, this.titleValue, this.isCheckExport, null, {
          page: 0,
          size: 3000,
        })
        .subscribe(
          (res) => {
            if (res != null) {
              const blob = new Blob([res], {
                type: 'application/octet-stream',
              });
              const blobURL = window.URL.createObjectURL(blob);
              const tempLink = document.createElement('a');
              tempLink.style.display = 'none';
              tempLink.href = blobURL;
              tempLink.setAttribute('download', fileName);
              if (typeof tempLink.download === 'undefined') {
                tempLink.setAttribute('target', '_blank');
              }
              document.body.appendChild(tempLink);
              tempLink.click();
              document.body.removeChild(tempLink);
              setTimeout(() => {
                window.URL.revokeObjectURL(blobURL);
              }, 100);
            }
            this.titleValue = null;
            this.isCheckExport = null;
            this.resetOptionExcel();
            this.isLoading = false;
          },
          // () => {
            // package 0d
            (err) => {
              const errorMessages: Record<number, string> = {
                900: 'Không lấy được thông tin gói cước!',
                901: 'Vui lòng đăng ký gói cước chính thức để sử dụng chức năng này!',
              };

              const title =
                errorMessages[err.status] ||
                'Dữ liệu quá lớn, vui lòng chọn lại thời gian tìm kiếm';
              const content = '';
              this.notification.create('error', title, content, {
                vPlacement: 'bottomRight',
              });
            this.isLoading = false;
          }
        );
    } else {
      this.notification.create(
        'error',
        'Dữ liệu quá lớn, vui lòng chọn lại thời gian tìm kiếm',
        '',
        { vPlacement: 'bottomRight' }
      );
    }
    this.isExport = false;
  }

  resetOptionExcel() {
    this.radioValue = 'A';
    this.radioValue2 = 'C';
    this.radioValue3 = 'E';
    this.radioOtherValue = 'other';
  }

  //#region Event checkbox and delete invoice
  showModalDelete(type: number, id: string): void {
    this.typeDelete = type;
    this.idDelete = id;
    //type = 1: Xóa theo danh sách đã chọn trên grid
    //type = 2: Xóa 1 hóa đơn ở cột thao tác
    if (this.typeDelete == 1) {
      if (this.setOfCheckedId.size <= 0) {
        this.notification.create('warning', 'Yêu cầu chọn hóa đơn', '', {
          vPlacement: 'bottomRight',
        });

        return;
      }

      if (this.selectedInvs.length == 0) {
        this.notification.create('warning', 'Yêu cầu chọn hóa đơn', '', {
          vPlacement: 'bottomRight',
        });

        return;
      }

      let datasDeleted = this.selectedInvs.filter(
        (x) =>
          x.status_approver == '1' && // kiểm tra trạng thái chưa duyệt
          x.type_invoice == '0' && // kiểm tra là hóa đơn nhập thủ công
          (x.invOrigin == null || x.invOrigin == 0) // kiểm tra điều kiện invOrigin
      );
      if (this.selectedInvs.length > datasDeleted?.length) {
        const confirmModal = this.modal.info({
          vTitle: 'Thông báo',
          vContent:
            'Chỉ được phép xóa hóa đơn <b>nhập thủ công</b> và trạng thái <b>Chưa duyệt</b>. <p>Vui lòng kiểm tra lại</p>',
          vOnOk: () => {
            confirmModal.close();
          },
        });

        return;
      }

      this.listIdDelete = Array.from(this.setOfCheckedId);
    }

    if (this.typeDelete == 2) {
      let invoice = this.invoices.find((x) => x.id == id);

      if (
        invoice.type_invoice == '1' ||
        (invoice.type_invoice == '0' && invoice.status_approver != '1')
      ) {
        this.notification.create(
          'warning',
          'Chỉ được phép xóa các hóa đơn giấy có trạng thái chưa duyệt. Vui lòng kiểm tra lại',
          '',
          {
            vPlacement: 'bottomRight',
          }
        );

        return;
      } else {
        this.listIdDelete.push(id);
      }
    }

    this.isVisibleDelete = true;
  }

  openModalApprovers(): void {
    if (this.setOfCheckedId.size <= 0) {
      this.notification.create('warning', 'Yêu cầu chọn hóa đơn', '', {
        vPlacement: 'bottomRight',
      });
      return;
    }

    if (this.selectedInvs.length == 0) {
      this.notification.create('warning', 'Yêu cầu chọn hóa đơn', '', {
        vPlacement: 'bottomRight',
      });
      return;
    }

    let datasInvalid = this.selectedInvs.find((x) =>
      ['3', '4'].includes(x.status_approver)
    );
    if (datasInvalid != null) {
      const confirmModal = this.modal.info({
        vTitle: 'Thông báo',
        vContent:
          'Chỉ phê duyệt các hóa đơn ở trạng thái <b>Chưa duyệt</b> hoặc <b>Từ chối duyệt</b>. <p>Vui lòng kiểm tra lại</p>',
        vOnOk: () => {
          confirmModal.close();
        },
      });
      return;
    }

    this.isVisibleApprover2 = true;
  }

  showModalApprover(): void {
    if (this.setOfCheckedId.size <= 0) {
      this.notification.create('warning', 'Yêu cầu chọn hóa đơn', '', {
        vPlacement: 'bottomRight',
      });
      return;
    }

    if (this.setOfCheckedId.size != 0) {
      let ids = Array.from(this.setOfCheckedId);
      if (ids?.length > 0) {
        this.invoiceService.listApprover(ids).subscribe(
          (res) => {
            if (res && res.body) {
              this.checkedAll = false;
              this.setOfCheckedId = new Set<string>();

              if (res.body.err_code == 0) {
                let messNoti = 'Phê duyệt hóa đơn thành công';
                if (ids.length != 1) {
                  messNoti = 'Phê duyệt lô hóa đơn thành công';
                }
                this.notification.create('success', messNoti, '', {
                  vPlacement: 'bottomRight',
                });

                this.refreshSelectedInvoice();
                this.loadPage(this.page);
                this.loadMoney(this.page);

                return;
              } else {
                if (res.body.message == 'INVOICE_APPROVED_CONFLICT') {
                  this.notification.create(
                    'error',
                    'Phê duyệt hóa đơn không thành công',
                    'Tồn tại hoá đơn đã phê duyệt',
                    { vPlacement: 'bottomRight' }
                  );
                } else {
                  this.notification.create('error', '', res.body.message, {
                    vPlacement: 'bottomRight',
                  });
                }
              }
            } else {
              this.notification.create('error', '', 'Có lỗi xảy ra', {
                vPlacement: 'bottomRight',
              });
            }
          },
          () => {
            this.notification.create(
              'error',
              'Phê duyệt lô hóa đơn không thành công',
              'Có lỗi xảy ra',
              { vPlacement: 'bottomRight' }
            );
          }
        );
      } else {
        this.notification.create('warning', 'Yêu cầu chọn hóa đơn', '', {
          vPlacement: 'bottomRight',
        });
      }
    }
    this.isVisibleApprover2 = false;
  }

  refreshSelectedInvoice(): void {
    this.setOfCheckedId = new Set<string>();
    this.setOfCheckedApprover = new Set<string>();
    this.selectedInvs = [];
  }

  showReason(reason: string[]): void {
    this.isVisibleReason = true;
    this.reason = reason;
  }

  handleCancelReason(): void {
    this.isVisibleReason = false;
  }

  onRadioChange($event) {
    this.isCheckExport = $event;
  }

  onTitleClickOther() {
    this.titleValue = 'other';
  }

  onTitleClick() {
    this.titleValue = 'misa';
  }

  onTitleClick2() {
    this.titleValue = 'fast';
  }

  onTitleClick3() {
    this.titleValue = 'smart';
  }

  openApprover(invoice: any): void {
    this.isVisibleApprover = true;
    this.IdApprover = [];
    this.setIdApprover(invoice);
  }

  setIdApprover(invoice: IInvoice): void {
    this.IdApprover.push(invoice.id);
  }

  setApprover(): void {
    var a = this.IdApprover[0];
    var b;
    this.invoiceService.getV1ById(a).subscribe((res) => {
      b = JSON.parse(res.body.content);
      if (
        b.status_approver == '1' ||
        b.status_approver == '2' ||
        b.status_approver == '0' ||
        b.status_approver == '5'
      ) {
        this.invoiceService.listApprover(this.IdApprover).subscribe(
          (res) => {
            if (res.body.err_code == 0) {
              this.notification.create(
                'success',
                'Phê duyệt hóa đơn thành công',
                '',
                { vPlacement: 'bottomRight' }
              );
            } else {
              this.notification.create('error', res.body.message, '', {
                vPlacement: 'bottomRight',
              });
            }

            this.listIdApprover = [];

            this.loadPage(this.page);
            this.loadMoney(this.page);
          },
          () => {
            this.notification.create(
              'error',
              'Phê duyệt hóa đơn không thành công',
              'Có lỗi xảy ra',
              { vPlacement: 'bottomRight' }
            );
          }
        );
      } else {
        this.notification.create('error', '', 'Bản ghi đã được phê duyệt', {
          vPlacement: 'bottomRight',
        });
        this.loadPage(this.page);
        this.loadMoney(this.page);
      }
    });
    this.isVisibleApprover = false;
  }

  handleCancelDelete(): void {
    this.setOfCheckedId = new Set<string>();
    this.listIdDelete = [];
    this.isVisibleDelete = false;
    this.isProgressDelete = false;
  }

  onDelete(): void {
    this.isProgressDelete = true;
    this.invoiceService.delete(this.listIdDelete).subscribe(
      (res) => {
        this.isVisibleDelete = false;
        this.isProgressDelete = false;
        if (res.body.err_code != 0) {
          if (res.body.message == 'INVOICE_NOT_EXISTED')
            return this.notification.create(
              'error',
              'Hóa đơn không tồn tại',
              '',
              {
                vPlacement: 'bottomRight',
              }
            );
          if (res.body.message == 'INVOICE_DELETED_CONFLICT') {
            this.notification.create(
              'error',
              'Xóa hóa đơn không thành công',
              'Hoá đơn đã bị xoá trước đó, thử lại sau',
              { vPlacement: 'bottomRight' }
            );
          } else
            return this.notification.create(
              'error',
              'Xóa hóa đơn không thành công',
              res.body.message,
              { vPlacement: 'bottomRight' }
            );
        }
        this.notification.create('success', 'Xóa thành công!', '', {
          vPlacement: 'bottomRight',
        });
        this.setOfCheckedId = new Set<string>();
        this.listIdDelete = [];
        this.onSearch();
        this.getTotalSync();
      },
      (error) => {
        this.isVisibleDelete = false;
        this.isProgressDelete = false;
      }
    );
  }

  updateCheckedSet(invoice: any, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(invoice.id);
      this.setOfCheckedApprover.add(invoice.status_approver);

      const index = this.selectedInvs.findIndex((x) => x.id === invoice.id);
      if (index < 0) {
        this.selectedInvs.push(invoice);
      }
    } else {
      this.setOfCheckedId.delete(invoice.id);
      this.setOfCheckedApprover.delete(invoice.status_approver);

      const index = this.selectedInvs.findIndex((x) => x.id === invoice.id);
      if (index >= 0) {
        this.selectedInvs.splice(index, 1);
      }
    }
  }

  onItemChecked(invoice: any, checked: boolean): void {
    this.updateCheckedSet(invoice, checked);
    this.checkedAllStatus();
  }

  onAllChecked(value: boolean): void {
    this.invoices.forEach((item) => this.updateCheckedSet(item, value));
    this.checkedAllStatus();
  }

  onCurrentPageDataChange($event: any[]): void {
    this.invoices = $event;
    this.checkedAllStatus();
  }

  checkedAllStatus(): void {
    this.checkedAll =
      this.invoices.length == 0 || this.setOfCheckedId.size == 0
        ? false
        : this.invoices.every((item) => this.setOfCheckedId.has(item.id));
  }
  //#endregion Event checkbox

  showModalTag() {
    if (this.setOfCheckedId.size <= 0) {
      this.notification.create('warning', 'Yêu cầu chọn hóa đơn', '', {
        vPlacement: 'bottomRight',
      });
      return;
    }

    const modal = this.modal.create({
      vTitle: 'Dán nhãn hàng loạt',
      vContent: TagInvoiceComponent,
      vWidth: '768px',
      vViewContainerRef: this.viewContainerRef,
      vComponentParams: {
        ids: Array.from(this.setOfCheckedId),
        isDetail: false,
      },
      vFooter: null,
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.data === RESPONSE_CODE_SUCCESS) {
        this.loadPage(this.page);
        this.loadMoney(this.page);
      }
    });
  }

  onQueryParamsChange(params: VTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    this.setOfCheckedId.clear();
    if (this.page !== pageIndex || this.size !== pageSize) {
      this.page = pageIndex;
      this.size = pageSize;
      this.loadPage(this.page);
      this.loadMoney(this.page);
    }
  }

  downloadInvoice(data) {
    this.invoiceService.downloadAllFile(data.id).subscribe((res) => {
      if (res.status != 200 || res.body == null) {
        this.notification.create(
          'error',
          '',
          'Có lỗi trong quá trình tải files!',
          {
            vPlacement: 'bottomRight',
          }
        );
        return;
      }
      FileSaver.saveAs(res.body, 'Hoadon' + data.ttchung?.shdon + '.zip');
    });
  }

  retryInvoice() {
    if (this.setOfCheckedId.size <= 0) {
      this.notification.create('warning', 'Yêu cầu chọn hóa đơn', '', {
        vPlacement: 'bottomRight',
      });
      return;
    }
    this.isLoading = true;

    this.invoiceService
      .updateValidate({ ids: Array.from(this.setOfCheckedId) })
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (res.body.err_code == 0) {
            this.notification.create(
              'success',
              '',
              'Kiểm tra lại hóa đơn thành công',
              {
                vPlacement: 'bottomRight',
              }
            );
            this.loadPage(1);
            this.loadMoney(1);
          } else {
            this.notification.create(
              'error',
              '',
              'Kiểm tra lại hóa đơn không thành công',
              {
                vPlacement: 'bottomRight',
              }
            );
          }
        },
        (error) => {
          this.isLoading = false;
        }
      );
  }

  viewInvDuplicates(): void {
    const modal = this.modal.create({
      vTitle:
        'Danh sách hóa đơn trên hệ thống đang trùng với dữ liệu hóa đơn từ Cơ quan thuế',
      vContent: InvDuplicateComponent,
      vComponentParams: {},
      vWidth: '1000px',
      vFooter: null,
      vMaskClosable: false,
    });

    modal.afterClose.subscribe((result) => {
      if (result && result.data === '1') {
        this.loadPage(this.page);
        this.loadMoney(this.page);
      }
    });
  }

  //region Kiểm tra trạng thái trên CQT
  comparewithtax() {
    if (this.setOfCheckedId.size <= 0) {
      this.notification.create('warning', 'Yêu cầu chọn hóa đơn', '', {
        vPlacement: 'bottomRight',
      });
      return;
    }

    this.isCompareWithTax = true;
  }

  handleCancelCompareWithTax() {
    this.isCompareWithTax = false;
  }

  handleCompareWithTax() {
    this.isProgressCompare = true;
    this.invoiceService
      .comparewithtax(Array.from(this.setOfCheckedId))
      .subscribe(
        (res) => {
          this.isProgressCompare = false;
          if (res.body.err_code == 0) {
            this.isCompareWithTax = false;
            const modal = this.modal.create({
              vContent: CompareTaxComponent,
              vWidth: '1000px',
              vTitle: 'Kết quả kiểm tra trạng thái hóa đơn trên Cơ quan thuế',
              vComponentParams: {
                invoices: res.body.contents,
              },
              vFooter: null,
              vOnCancel: () => {
                return new Promise((resolve, reject) => {
                  this.modal.confirm({
                    vTitle: 'Thông báo xác nhận huỷ bỏ',
                    vContent: 'Bạn có chắc chắn muốn huỷ bỏ?',
                    vOnOk: () => {
                      resolve();
                    },
                    vOnCancel: () => {
                      reject();
                    },
                  });
                });
              },
            });

            modal.afterClose.subscribe((response) => {
              if (response && response.isOk) {
                this.notification.create('success', '', response.message, {
                  vPlacement: 'bottomRight',
                });
                this.loadPage(this.page);
                this.loadMoney(this.page);
              }
            });
          } else {
            this.notification.create(
              'error',
              '',
              res.body.message
                ? res.body.message
                : 'Kiểm tra lại hóa đơn không thành công',
              {
                vPlacement: 'bottomRight',
              }
            );
          }
        },
        (error) => {
          this.isProgressCompare = false;
        }
      );
  }
  //endregion

  downloadMultiXml(): void {
    this.isLoading = true;
    if (this.setOfCheckedId.size <= 0) {
      this.notification.create('warning', 'Yêu cầu chọn hóa đơn', '', {
        vPlacement: 'bottomRight',
      });
      this.isLoading = false;
      return;
    }

    let invIds = Array.from(this.setOfCheckedId);
    if (invIds?.length > 0) {
      this.invoiceService.downloadMultiXml(invIds).subscribe(
        (res) => {
          this.isLoading = false;
          this.setOfCheckedId = new Set<string>();
          this.checkedAll = false;

          FileSaver.saveAs(res.body, 'HDDV_XML.zip');
        },
        (err) => {
          let title = 'Tải xml thất bại!';
          let content = 'Có lỗi xảy ra';
          if (err.status == 900) {
            title = 'Không lấy được thông tin gói cước!';
            content = '';
          } else if (err.status == 901) {
            title =
              'Vui lòng đăng ký gói cước chính thức để sử dụng chức năng này!';
            content = '';
          }

          this.isLoading = false;
          this.setOfCheckedId = new Set<string>();
          this.checkedAll = false;
          this.notification.create('error', title, content, {
            vPlacement: 'bottomRight',
          });
        }
      );
    } else {
      this.isLoading = false;
      this.notification.create('warning', 'Yêu cầu chọn hóa đơn', '', {
        vPlacement: 'bottomRight',
      });
    }
  }

  downloadMultiPDF(): void {
    this.isLoading = true;
    const invIds = this.invoices
      ?.filter((inv) => this.setOfCheckedId?.has(inv?.id))
      .map((inv) => inv.id);
    if (!invIds?.length) {
      this.notification.create('warning', 'Yêu cầu chọn hóa đơn cần tải', '', {
        vPlacement: 'bottomRight',
      });
      return;
    }
    if (invIds?.length > 0) {
      this.invoiceService.downloadMultiPDF(invIds).subscribe(
        (res) => {
          this.isLoading = false;
          FileSaver.saveAs(res.body, 'HDDV_PDF.zip');
        },
        (err) => {
          this.isLoading = false;
          this.notification.create(
            'error',
            'Tải xml thất bại!',
            'Có lỗi xảy ra',
            {
              vPlacement: 'bottomRight',
            }
          );
        }
      );
    } else {
      this.isLoading = false;
      this.notification.create('warning', 'Yêu cầu chọn hóa đơn', '', {
        vPlacement: 'bottomRight',
      });
    }
  }

  getDatasChecked(): any {
    if (this.setOfCheckedId.size > 0) {
      let datasChecked = this.invoices.filter((item) =>
        this.setOfCheckedId.has(item.id)
      );
      return datasChecked;
    }
    return null;
  }

  //#region In hóa đơn
  /**
   * in hóa đơn
   * @param type : loại in: 0-in lẻ; 1-in lô
   * @param data : hóa đơn cần in
   */
  async Print(type?: number, data?: any) {
    if (type == 1) {
      if (this.setOfCheckedId.size <= 0) {
        this.notification.create('warning', 'Yêu cầu chọn hóa đơn cần in', '', {
          vPlacement: 'bottomRight',
        });
        return;
      }

      let ids = Array.from(this.setOfCheckedId);
      let selecteds = this.invoices.filter((x) => ids.includes(x.id));
      if (selecteds.length <= 0) {
        this.notification.create('warning', 'Yêu cầu chọn hóa đơn cần in', '', {
          vPlacement: 'bottomRight',
        });
        return;
      }

      this.packConfService.validFunc(PERMISSION_PRINT_MULTI).subscribe(
        async (res) => {
          if (res.body.err_code === RESPONSE_CODE_SUCCESS) {
            this.isPrinting = true;
            this.printSelected = [];
            if (this.cssPrint?.length <= 0) {
              await this.loadCssFile();
            }

            let selectedNotPDF = selecteds.filter(
              (x) => !this.getFilePDF(x)?.isPdf
            );
            if (selectedNotPDF?.length > 0) {
              selectedNotPDF.map((item) => this.printSelected.push(item));
              this.changeDetectorRef.detectChanges();
            }

            const pdfPromises = selecteds.map(async (item) => {
              const currentFile = this.getFilePDF(item);
              if (currentFile !== null && currentFile.isPdf) {
                const arraybuffer = await this.pdfService
                  .loadPdfToArraybuffer(currentFile.url)
                  .toPromise();
                return arraybuffer;
              } else {
                if (this.cssPrint && this.cssPrint.length > 0) {
                  const content = this.getContentPrint(item, this.cssPrint);
                  if (content && content.length > 0) {
                    const response = await this.pdfService
                      .convertHtmlToPdf(content)
                      .toPromise();
                    return this.pdfService.base64ToArrayBuffer(
                      response?.file_base64
                    );
                  }
                }
              }
            });

            try {
              const pdfs = await Promise.all(pdfPromises);

              const pdfDoc = await PDFDocument.create();
              for (const pdf of pdfs) {
                if (pdf) {
                  const existingPdfDoc = await PDFDocument.load(pdf);
                  const pages = existingPdfDoc.getPages();

                  for (let i = 0; i < pages.length; i++) {
                    const page = await pdfDoc.copyPages(existingPdfDoc, [i]);
                    pdfDoc.addPage(page[0]);
                  }
                }
              }

              const mergedPdfBytes = await pdfDoc.save();
              const blob = new Blob([mergedPdfBytes], {
                type: 'application/pdf',
              });
              const url = window.URL.createObjectURL(blob);
              await this.openPrint(url, 1);
              setTimeout(() => {
                URL.revokeObjectURL(url);
              }, 10000); // Thu hồi sau 10 giây

              this.isPrinting = false;
              this.printSelected = [];
            } catch (error) {
              this.notification.create(
                'error',
                'Có lỗi xảy ra trong quá trình in hóa đơn',
                '',
                { vPlacement: 'bottomRight' }
              );
              this.isPrinting = false;
              this.printSelected = [];
            }
          } else {
            this.setOfCheckedId = new Set<string>();
            this.checkedAll = false;

            this.notification.create('error', '', res.body.message, {
              vPlacement: 'bottomRight',
            });
          }
        },
        (error: any) => {
          this.notification.create('error', '', error, {
            vPlacement: 'bottomRight',
          });
        }
      );
    } else {
      this.packConfService
        .validFunc(PERMISSION_PRINT_ONE)
        .subscribe(async (res) => {
          if (res && res.body) {
            if (res.body.err_code == RESPONSE_CODE_SUCCESS) {
              let currentFile = this.getFilePDF(data);
              if (currentFile != null && currentFile.isPdf) {
                this.isPrinting = true;
                this.pdfService
                  .loadPdfToBlob(currentFile.url)
                  .subscribe((blob: Blob) => {
                    const blobUrl = URL.createObjectURL(blob);
                    this.openPrint(blobUrl, 0);
                    this.isPrinting = false;
                  });
              } else if (data != null) {
                this.printSelected = [];
                this.printSelected.push(data);
                this.changeDetectorRef.detectChanges();
                if (this.cssPrint?.length <= 0) {
                  await this.loadCssFile();
                }

                if (this.cssPrint?.length > 0) {
                  let content = this.getContentPrint(data, this.cssPrint);
                  if (content?.length > 0) {
                    this.isPrinting = true;

                    this.pdfService.convertHtmlToPdf(content).subscribe(
                      (response) => {
                        // Xử lý phản hồi từ server (response)
                        if (response?.file_base64?.length > 0) {
                          const arrayBuffer = this.pdfService.base64ToArrayBuffer(
                            response.file_base64
                          );
                          if (arrayBuffer) {
                            this.isPrinting = false;
                            const blob = new Blob([arrayBuffer], {
                              type: 'application/pdf',
                            });
                            const blobUrl = URL.createObjectURL(blob);
                            this.openPrint(blobUrl, 0);
                            this.isPrinting = false;
                            this.printSelected = [];
                          }
                        }
                      },
                      (error) => {
                        // Xử lý lỗi
                        this.isPrinting = false;
                        this.notification.create('error', '', error, {
                          vPlacement: 'bottomRight',
                        });
                      }
                    );
                  } else {
                    this.notification.create(
                      'error',
                      'Có lỗi xảy ra trong quá trình in hóa đơn',
                      '',
                      { vPlacement: 'bottomRight' }
                    );
                  }
                }
              }
            } else {
              this.notification.create('error', '', res.body.message, {
                vPlacement: 'bottomRight',
              });
            }
          } else {
            this.notification.create(
              'error',
              'Có lỗi xảy ra',
              'Vui lòng thử lại sau!',
              { vPlacement: 'bottomRight' }
            );
          }
        });
    }
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async openPrint(blobUrl: string, type: number) {
    // Mở URL trong một cửa sổ mới
    const printWindow = window.open(blobUrl, '_blank');
    await this.sleep(type === 0 ? 0 : 5000);
    // Kiểm tra xem cửa sổ có được mở thành công hay không
    if (printWindow) {
      // Thiết lập sự kiện onload
      printWindow.onload = () => {
        printWindow.print();
      };

      printWindow.focus();
    } else {
      console.error('Việc mở cửa sổ đã bị trình duyệt chặn.');
      alert('Vui lòng cho phép pop-up cho trang web này.');
    }
  }

  getContentPrint(invoice, style?: string): string {
    const ulElement = document.getElementById('listPrint-' + invoice.id);
    if (ulElement) {
      let content = ulElement.innerHTML;
      if (content?.length > 0) {
        let head = `<head> <meta charset="UTF-8"><title>In hóa đơn</title></head><style>${style}</style>`;
        content = `<html>${head}<body>${content}</body></html>`;
        // console.log(content);
        return content;
      }
    }
    return null;
  }

  async loadCssFile(): Promise<string> {
    let urlCss = `${EVN.environment.testingEndpoint}assets/css/temp-inbot.css`;
    // let urlCss = `http://localhost:9000/assets/css/temp-inbot.css`;
    try {
      let style = await this.pdfService
        .loadCssFile(urlCss)
        .toPromise()
        .then((res) => {
          this.cssPrint = res;
          return res;
        });
      return style;
    } catch (error) {
      return null;
    }
  }

  getFilePDF(invoice?: any): any {
    try {
      if (invoice != null && invoice.files != null) {
        const file = invoice.files.find(
          (file) => file.type == 'application/pdf' && !file.isdelete
        );
        if (file) {
          return {
            isPdf: true,
            url:
              environment.ADMIN_SERVER_API_URL_FILE +
              'api/file?fileName=' +
              file.filename +
              '&objectName=' +
              file.url,
          };
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }
  //#endregion

  showModalSendemail(data: any): void {
    this.modal.create({
      vTitle: 'Gửi email phản hồi cho đơn vị phát hành hóa đơn',
      vContent: SendEmailComponent,
      vWidth: '1000px',
      vViewContainerRef: this.viewContainerRef,
      vComponentParams: {
        invoice: data,
      },
      vFooter: null,
    });
  }

  public async setDefault(): Promise<void> {
    // package 0d
    if (!this.isColumnConfig) {
      document.body.click();
      this.notification.create('error', this.isColumnConfigNoti, '', {
        vPlacement: 'bottomRight',
      });
    } else {
    this.isLoading = true;
    this.isConfig = false;
    try {
      await Promise.all([this.setDefaultColumns(), this.setDefaultExtras()]);

      this.autoConfigService
        .query(this.accountService.getAccount().orgCode)
        .subscribe((res) => {
          if (res != null && res.body.content) {
            this.autoConfig = res.body.content;
            this.extraColumns = this.autoConfig?.extra;
            if (this.extraColumns != null) {
              this.columns = this.columns.concat(
                this.formatExtraToCol(this.extraColumns)
              );
            }
          }
        });
    } catch (error) {
    } finally {
      this.isLoading = false;
    }
    // package 0d
    }
  }

  async setDefaultColumns(): Promise<void> {
    try {
      await this.gridConfigsService.setDefault({ table: 'INBOT' }).toPromise();
      const res = await this.gridConfigsService.getGrid('INBOT').toPromise();

      if (
        res.body &&
        res.body.content &&
        Array.isArray(res.body.content.columns)
      ) {
        this.columns = res.body.content.columns
          .sort((a, b) => a.position - b.position)
          .filter(
            (item) =>
              !['mauSo', 'soHoaDon', 'kyHieu', 'maSoThueNguoiBan'].includes(
                item.field
              )
          );
      }
    } catch (error) {}
  }

  setDefaultExtras(): void {
    const account = this.accountService.getAccount();
    const autoConfig: IAutoConfig = {
      org_code: account.orgCode,
      org_id: account.id,
      org_name: account.name,
      user_name: account.username,
      auto_download_inv: this.autoConfig?.AutoDownloadInv,
      extra: this.extraColumns.map((item) => ({ ...item, activated: false })),
    };
    // package 0d
    this.invoiceService.updateColumnConfig(autoConfig).subscribe((res) => {});
    // this.autoConfigService.update(autoConfig).subscribe((res) => {});
  }

  public saveGrid(): void {
    // package 0d
    if (!this.isColumnConfig) {
      document.body.click();
      this.notification.create('error', this.isColumnConfigNoti, '', {
        vPlacement: 'bottomRight',
      });
    } else {
    const iGrid = new GridConfig();
    iGrid.table = 'INBOT';
    iGrid.columns =
      this.extraColumns === null
        ? this.columns
        : (iGrid.columns = this.columns.filter((itemCol) => {
            return !this.extraColumns.some(
              (extraCol) => extraCol.field === itemCol.field
            );
          }));
    const autoConfig: IAutoConfig = {
      org_code: this.accountService.getAccount().orgCode,
      org_id: this.accountService.getAccount().id,
      org_name: this.accountService.getAccount().name,
      user_name: this.accountService.getAccount().username,
      auto_download_inv: this.autoConfig?.AutoDownloadInv,
      extra:
        this.extraColumns === null
          ? null
          : this.formatColToExtra(
              this.columns.filter((itemCol) => {
                return this.extraColumns.some(
                  (extraCol) => extraCol.field === itemCol.field
                );
              })
            ),
    };

    Promise.all([
      this.gridConfigsService.putGridUser(iGrid).toPromise(),
      // package 0d
      this.invoiceService.updateColumnConfig(autoConfig).toPromise(),
      // this.autoConfigService.update(autoConfig).toPromise(),
    ])
      .then(([putGridUserResponse, updateAutoConfigResponse]) => {
        this.isConfig = false;
        this.notification.create('success', '', 'Cập nhật thành công', {
          vPlacement: 'bottomRight',
        });
      })
      .catch(() => {
        this.notification.create('error', '', `Có lỗi xảy ra`, {
          vPlacement: 'bottomRight',
        });
      });
    // package 0d
    }
  }

  public isView(field): boolean {
    let checkShow = false;
    this.columns.forEach((column) => {
      if (column.field === field) {
        checkShow = column.activated;
        return checkShow;
      }
    });
    return checkShow;
  }

  handleInputEvent(id: string, data: string, position: number) {
    this.itemOnEdit = '';
    if (
      data !== this.inputCurrentData ||
      id !== this.inputCurrentID ||
      position !== this.inputCurrentPosition
    ) {
      this.inputCurrentData = data;
      this.inputCurrentID = id;
      this.inputCurrentPosition = position;
      const inputExtra: IInputExtra = {
        id: id,
        extra: data,
        position: position,
      };
      this.invoiceService
        .updateExtraInvoiceByID(inputExtra)
        .subscribe((res) => {});
    }
  }

  startEditExtra(id: string, extra: string): void {
    this.editId = id;
    this.editExtra = extra;
  }

  stopEditExtra(id: string, data: string, position: number): void {
    this.editId = null;
    this.editExtra = null;
    if (
      data !== this.inputCurrentData ||
      id !== this.inputCurrentID ||
      position !== this.inputCurrentPosition
    ) {
      this.inputCurrentData = data;
      this.inputCurrentID = id;
      this.inputCurrentPosition = position;
      const inputExtra: IInputExtra = {
        id: id,
        extra: data,
        position: position,
      };
      this.invoiceService
        .updateExtraInvoiceByID(inputExtra)
        .subscribe((res) => {});
    }
  }

  startEditPayment(id: string): void {
    this.editPayment = id;
  }

  stopEditPayment(id: string, data: string): void {
    this.editPayment = null;
    this.handleSelectPayment(id, data);
  }

  handleSelectPayment(id: string, data: string): void {
    const paymentRequest: any = {
      id: id,
      value: data,
    };
    this.invoiceService.updatePaymentInvoiceByID(paymentRequest).subscribe(
      () => {},
      () => {
        this.notification.create('error', 'Cập nhật không thàh công', '', {
          vPlacement: 'bottomRight',
        });
      }
    );
  }

  displayPayment(status: number): string {
    if (!this.listPayment) {
      return '';
    }

    const payment = this.listPayment.find((item) => item.value === status);
    return payment ? payment.name : '';
  }

  limitInputLength(event: any) {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;

    if (inputValue.length > 20) {
      input.value = inputValue.slice(0, 20);
    }
  }

  enableEditMode(extra: number, id: string) {
    this.itemOnEdit = id;
    const editModePropertyName = `editModeExtra${extra}`;
    if (this.hasOwnProperty(editModePropertyName)) {
      this[editModePropertyName] = true;
    }
  }

  checkItemEdit(id: string): boolean {
    if (id === this.itemOnEdit) {
      return true;
    }
  }

  showAdv(): void {
    this.isAdv = !this.isAdv;
  }

  // package 0d
  handleCheckboxChange(newValue: boolean, column: any) {
    if (this.isColumnConfig) {
      column.activated = newValue;
    } else {
      document.body.click();
      this.gridConfigsService
        .getGridConfigUser({ table: 'INBOT' })
        .subscribe((res) => {
          if (res.body && res.body.content) {
            this.columns = res.body.content
              .sort((a, b) => a.position - b.position)
              .filter(
                (item) =>
                  !['mauSo', 'soHoaDon', 'kyHieu', 'maSoThueNguoiBan'].includes(
                    item.field
                  )
              );
          }
          this.getExtraColumns();
        });
      this.notification.create('error', this.isColumnConfigNoti, '', {
        vPlacement: 'bottomRight',
      });
    }
  }
}
