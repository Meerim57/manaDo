import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { LayoutComponent } from './pages/layout/layout.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NavBarDialogComponent } from './pages/layout/nav-bar-dialog/nav-bar-dialog.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { StatisticComponent } from './pages/statistic/statistic.component';
import { BoardComponent } from './pages/board/board.component';
import { TaskDialogComponent } from './pages/board/task-dialog/task-dialog.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog';
import { LoginComponent } from './pages/login/login.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PersonInfoComponent } from './pages/profile/person-info/person-info.component';
import { TeamComponent } from './pages/profile/team/team.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    TaskDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatIconModule,
    ReactiveFormsModule,
    LayoutComponent,
    DragDropModule,
    MatDialogModule,
    NavBarDialogComponent,
    SignUpComponent,
    StatisticComponent,
    LoginComponent,
    NotFoundComponent,
    ProfileComponent,
    PersonInfoComponent,
    TeamComponent,
    CommonModule,
    BoardComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
