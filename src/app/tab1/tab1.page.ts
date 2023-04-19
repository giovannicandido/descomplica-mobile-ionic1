import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonicModule, ViewDidEnter } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { PessoaService } from '../service/pessoa.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, ReactiveFormsModule],
})
export class Tab1Page implements ViewDidEnter {

  formGroup: FormGroup = this.fb.group({
    nome: ['', Validators.required],
    telefone: [''],
    email: ['', Validators.email],
    hobie: ['']
  })

  emailToEdit : string | null = null


  constructor(private fb: FormBuilder,
    private pessoaService: PessoaService,
    private alertController: AlertController,
    private activedRouter: ActivatedRoute) { }

  ionViewDidEnter(): void {
    this.emailToEdit = null
    const email = this.activedRouter.snapshot.paramMap.get("email");
    if(email) {
      console.log(email)
      this.pessoaService.get(email).then(pessoa => {
        if(pessoa) {
          this.formGroup.patchValue(pessoa)
          this.emailToEdit = email
        }
      })
    }
  }

  async salvar() {
    if (this.formGroup.valid) {
      if(this.emailToEdit) {
        this.pessoaService.editar(this.formGroup.value, this.emailToEdit)
      }else {
        this.pessoaService.criar(this.formGroup.value)
      }
      const alert = await this.alertController.create({
        header: 'Item salvo',
        message: 'Item salvo com sucesso',
        buttons: ['OK'],
      })
      await alert.present()
    } else {
      const alert = await this.alertController.create({
        header: 'Formulário inválido',
        message: 'Formulário inválido',
        buttons: ['OK'],
      })
      await alert.present()
    }
  }
}
