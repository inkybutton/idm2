package controllers;

import models.CaptureSession;
import models.CapturedGesture;
import models.ScreenResolution;
import play.libs.MimeTypes;
import play.mvc.Controller;
import play.mvc.Http;
import play.vfs.VirtualFile;
import utils.GestureListBinder;
import utils.PartialContent;

import java.io.File;
import java.io.InputStream;
import java.util.List;

public class Application extends Controller {

    public static void index() {
        render();
    }


    /**
     * Allows an asset file to be shared partially.
     * Code derived from https://gist.github.com/1781977.
     * @param fileName - A path relative to the /public directory.
     */

    public static void cues(String fileName){
        response.setHeader("Accept-Ranges", "bytes");
        VirtualFile f = VirtualFile.fromRelativePath("/public/assets/cues/"+fileName);
        if (!f.exists()){
            notFound();
        }
        InputStream underlyingFile = f.inputstream();
        File realFile = f.getRealFile();
        //String fileName = ...//name of the file

        Http.Header rangeHeader = request.headers.get("range");
        if (rangeHeader != null) {
            throw new PartialContent(realFile, fileName);
        } else {

            renderBinary(underlyingFile,
                    fileName, realFile.length(),
                    MimeTypes.getContentType(fileName), false);
        }


    }

    public static void iostest(){
        render();
    }

    public static void submitData(ScreenResolution screen,String captured){
        GestureListBinder b = new GestureListBinder();
        try {
            List<CapturedGesture> gs = b.deserialise(captured);
            CaptureSession thisSession = new CaptureSession(gs,screen);
            thisSession.save();
        } catch (Exception e) {
            e.printStackTrace();
        }
        render();
    }

    public static void overview(){
        renderArgs.put("numNew",CaptureSession.getNotDownloaded().size());
        renderArgs.put("numOld",CaptureSession.getDownloaded().size());
        render();
    }

    public static void getNewCSV(){
        List<CaptureSession> sessions = CaptureSession.getNotDownloaded();
        response.contentType = "text/csv";
        for (CaptureSession s:sessions){
            try {
                response.writeChunk(s.downloadCSV().call());
            } catch (Exception e){
                e.printStackTrace();
            }
        }       
    }
    
    public static void getOldCSV(){
        List<CaptureSession> sessions = CaptureSession.getDownloaded();
        response.contentType = "text/csv";
        for (CaptureSession s:sessions){
            try {
                response.writeChunk(s.downloadCSV().call());
            } catch (Exception e){
                e.printStackTrace();
            }
        }
    }
    
    public static void getAllCSV(){
        List<CaptureSession> sessions = CaptureSession.all().fetch();
        response.contentType = "text/csv";
        for (CaptureSession s:sessions){
            try {
                response.writeChunk(s.downloadCSV().call());
            } catch (Exception e){
                e.printStackTrace();
            }
        } 
    }
}