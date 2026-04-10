<?php

namespace App;

enum InstitutionRoleEnum: string
{
    case PRINCIPAL = 'principal';
    case PROGRAM_COORDINATOR = 'program_coordinator';
    case COURSE_COORDINATOR = 'course_coordinator';
}
