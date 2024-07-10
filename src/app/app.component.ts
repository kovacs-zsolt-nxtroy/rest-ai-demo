import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatFabButton, MatIconButton} from "@angular/material/button";
import {MatCardHeader, MatCardModule} from "@angular/material/card";
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {HttpClient, HttpClientModule, HttpHeaders} from "@angular/common/http";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatSelectModule} from "@angular/material/select";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule, MatProgressSpinnerModule, MatCardModule, RouterOutlet, MatLabel, MatToolbar, MatIcon, MatIconButton, MatFormField, MatInput, ReactiveFormsModule, MatFabButton, MatError, MatCardHeader, MatSelectModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  public itemList: any[] = [];
  private http: HttpClient = inject(HttpClient);
  private formBuilder = new FormBuilder()
  form = this.formBuilder.group({
    prompt: new FormControl('', Validators.required),
    model: 'llama-3-sonar-small-32k-online',
    apikey: new FormControl('', Validators.required),
  })

  ngOnInit() {
  }

  onSubmit(event: any) {
    event.preventDefault()
    console.log(this.form)
    if (!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }
    const item = {
      model: this.form.get('model')?.value,
      prompt: this.form.get('prompt')?.value,
      waiting: true,
      content: ''
    }
    this.itemList.push(item)
    this.callApi(this.form.get('prompt')?.value ?? '',this.form.get('apikey')?.value ?? '',this.form.get('model')?.value ?? '').subscribe({
      next: (response) => {
        this.itemList[this.itemList.length - 1].waiting = false
        this.itemList[this.itemList.length - 1].content = response
      },
      error: (error) => {
        this.itemList[this.itemList.length - 1].waiting = false
        this.itemList[this.itemList.length - 1].content ={
          choices: [{
            message: {
              content: 'ERROR'
            }
          }]
        }
      }
    })
  }

  private callApi(content: string,apiKey: string,model:string) {
    const body = {
      "model": model,
      "messages": [
        {
          "role": "system",
          "content": "Be nice"
        },
        {
          "role": "user",
          content: content
        }
      ]
    }
    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('authorization', `Bearer ${apiKey}`)
      .set('accept', 'application/json');
    return this.http.post(`https://api.perplexity.ai/chat/completions`, body, {headers})
  }
}

