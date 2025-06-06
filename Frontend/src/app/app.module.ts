import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardComponent } from './pages/board/board.component';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TeamComponent } from './pages/profile/team/team.component';
import { PersonInfoComponent } from './pages/profile/person-info/person-info.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TaskDialogComponent } from './pages/board/task-dialog/task-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NavBarDialogComponent } from './pages/layout/nav-bar-dialog/nav-bar-dialog.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { StatisticComponent } from './pages/statistic/statistic.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    LayoutComponent,
    TaskDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    LoginComponent,
    NotFoundComponent,
    BrowserAnimationsModule,
    ProfileComponent,
    PersonInfoComponent,
    TeamComponent,
    DragDropModule,
    MatDialogModule,
    NavBarDialogComponent,
    SignUpComponent,
    StatisticComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
