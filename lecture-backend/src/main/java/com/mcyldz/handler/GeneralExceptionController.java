package com.mcyldz.handler;

import com.mcyldz.common.GeneralException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GeneralExceptionController {

    @ExceptionHandler(value = GeneralException.class)
    public ResponseEntity<ErrorMessage> exception(GeneralException generalException){
        return new ResponseEntity<>(new ErrorMessage(generalException.getMessage()), HttpStatus.BAD_REQUEST);
    }
}
