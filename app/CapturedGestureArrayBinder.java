import com.google.gson.Gson;
import com.google.gson.JsonArray;
import models.CapturedGesture;
import play.data.binding.TypeBinder;

import java.lang.annotation.Annotation;
import java.lang.reflect.Type;

/**
 * User: Noel Zeng.
 * Part of PACKAGE_NAME.
 */

public class CapturedGestureArrayBinder implements TypeBinder<CapturedGesture[]> {

    @Override
    public Object bind(String name, Annotation[] annotations, String value, Class actualClass, Type genericType) throws Exception {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    private CapturedGesture deserialiseGesture(JsonArray a){
         Gson g = new Gson();
         return null;
    }
}
