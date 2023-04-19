import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Pessoa } from '../model/pessoa';
import { PessoaService } from '../service/pessoa.service';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subscription, distinctUntilChanged, debounceTime } from 'rxjs';
import { FormPessoa } from '../components/form-pessoa';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, CommonModule, ReactiveFormsModule]
})
export class Tab2Page implements ViewDidEnter, OnInit, OnDestroy {
  pessoas: Pessoa[] = []
  loading = false
  filterForm = this.fb.group({
    nome: ['']
  })

  subscriptions: Subscription[] = []
  constructor(
    private pessoaService: PessoaService, 
    private router: Router,
    private toastController: ToastController,
    private fb: FormBuilder,
    private modalCtrl: ModalController
    ) {}
  
  
  
  ionViewDidEnter(): void {
    this.listar()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
  ngOnInit(): void {
    const sub = this.filterForm.valueChanges
    .pipe(
      debounceTime(400),
      distinctUntilChanged()
    )
    .subscribe(value => this.filtrar(value.nome!))
    this.subscriptions.push(sub)
  }

  listar() {
    this.loading = true
    this.pessoaService.listar().then((data) => {
      if(data) {
        this.pessoas = data
      }
      this.loading = false
    }).catch(error => {
      console.error(error)
      this.loading = false
    })
    
  }

  editar(pessoa: Pessoa) {
    this.router.navigate(['tabs/tab1', pessoa.email])
  }

  async filtrar(nome: string) {
    const pessoas = await this.pessoaService.findByNome(nome)
    this.pessoas = pessoas
  }

  async deletar(pessoa: Pessoa) {
    const deletado = await this.pessoaService.delete(pessoa.email)
    if(deletado) {
      this.listar()
      const toast = await this.toastController.create({
        message: 'Pessoa deletada com sucesso',
        duration: 1500,
        position: 'top'
      });
  
      await toast.present();
    }
  }

  async criarNovo() {
    const modal = await this.modalCtrl.create({
      component: FormPessoa,
      componentProps: {modal: true}
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if(role === 'close') {
      this.listar()
    }
  }

}
