package models;

import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * User: Noel Zeng.
 * Part of models.
 */

@Entity
public class ScreenResolution {
    @Id
    private Long resolutionId;
    public int x;
    public int y;
    
    public ScreenResolution(int x,int y){
        this.x = x;
        this.y = y;
    }
}
